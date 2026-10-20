import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, ne } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import {
  UpsertMyProfileBody,
  UpsertMyProfileResponse,
  GetMyProfileResponse,
  ListProfilesResponse,
} from "@workspace/api-zod";
import { haversineDistanceKm } from "../lib/distance";

const router: IRouter = Router();

type DbProfile = typeof profilesTable.$inferSelect;

/**
 * Strips raw coordinates from a DB row and adds a pre-rounded distanceKm.
 * distanceKm is null when the viewer's location is unknown, when the
 * target profile has no stored location, or when viewing your own profile.
 */
function toProfileResponse(
  profile: DbProfile,
  viewerLat?: number | null,
  viewerLon?: number | null,
): object {
  const { latitude, longitude, ...safe } = profile;

  const distanceKm =
    viewerLat != null &&
    viewerLon != null &&
    latitude != null &&
    longitude != null
      ? haversineDistanceKm(viewerLat, viewerLon, latitude, longitude)
      : null;

  return { ...safe, distanceKm };
}

router.get("/profiles", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [viewer] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, userId));

  const others = await db
    .select()
    .from(profilesTable)
    .where(ne(profilesTable.id, userId));

  // Age is enough for discovery; another user's exact birthday is not shared.
  const profiles = others.map((p) => ({
    ...toProfileResponse(p, viewer?.latitude, viewer?.longitude),
    birthday: null,
  }));

  res.json(ListProfilesResponse.parse({ profiles }));
});

router.get("/profiles/me", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, userId));

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(GetMyProfileResponse.parse(toProfileResponse(profile)));
});

router.put("/profiles/me", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpsertMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid profile input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (
    parsed.data.lookingFor?.includes("Everyone") &&
    parsed.data.lookingFor.length > 1
  ) {
    res.status(400).json({
      error: "Everyone cannot be combined with other Show Me preferences",
    });
    return;
  }

  const { latitude, longitude, ...profileFields } = parsed.data;

  const values = {
    id: userId,
    ...profileFields,
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
  };

  const [profile] = await db
    .insert(profilesTable)
    .values(values)
    .onConflictDoUpdate({
      target: profilesTable.id,
      set: {
        ...profileFields,
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        updatedAt: new Date(),
      },
    })
    .returning();

  res.json(UpsertMyProfileResponse.parse(toProfileResponse(profile)));
});

export default router;
