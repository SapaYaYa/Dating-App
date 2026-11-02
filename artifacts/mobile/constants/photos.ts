// Profile photo rules, shared by sign-up and the Profile screen.
export const PHOTO_RULES = {
  /** Required at sign-up and kept at all times. */
  MIN_PHOTOS: 3,
  /** More can be added later on the Profile screen. */
  MAX_PHOTOS: 8,
} as const;
