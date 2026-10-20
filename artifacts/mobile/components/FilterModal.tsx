import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DEFAULT_LOOKING_FOR,
  LOOKING_FOR_OPTIONS,
  type LookingForOption,
  toggleLookingForSelection,
} from "@/constants/lookingFor";

const { height: SCREEN_H } = Dimensions.get("window");
const THUMB = 28;
const SLIDER_H = THUMB + 16;        // container height — gives thumb room to breathe
const TRACK_TOP = (SLIDER_H - 4) / 2;  // center the 4px track bar inside SLIDER_H
const THUMB_TOP = (SLIDER_H - THUMB) / 2; // center thumb inside container
const MIN_GAP = THUMB + 4;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiscoverFilters {
  lookingFor: string[];
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  locationCity: string;
  useCurrentLocation: boolean;
  sexualOrientation: string[];
  ethnicity: string[];
  heightMin: number;
  heightMax: number;
  datingGoals: string[];
  intimacyPreferences: string[];
  smokingMarijuana: string[];
  smokingCigarettes: string[];
  smokingHookah: string[];
  smokingVaping: string[];
  drinking: string[];
  fitness: string[];
  diet: string[];
  personalityType: string[];
  zodiac: string[];
  religion: string[];
  politicalViews: string[];
  communicationStyle: string[];
  conflictResolution: string[];
  householdChores: string[];
  familyPlans: string[];
  hasKids: string[];
  pets: string[];
  educationLevel: string[];
  interests: string[];
  bodyType: string[];
  tattoos: string[];
  piercings: string[];
  verifiedOnly: boolean;
  activeRecently: boolean;
  dealbreakers: string[];
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  lookingFor: [...DEFAULT_LOOKING_FOR],
  ageMin: 18,
  ageMax: 40,
  maxDistance: 50,
  locationCity: "",
  useCurrentLocation: false,
  sexualOrientation: [],
  ethnicity: [],
  heightMin: 48,
  heightMax: 84,
  datingGoals: [],
  intimacyPreferences: [],
  smokingMarijuana: [],
  smokingCigarettes: [],
  smokingHookah: [],
  smokingVaping: [],
  drinking: [],
  fitness: [],
  diet: [],
  personalityType: [],
  zodiac: [],
  religion: [],
  politicalViews: [],
  communicationStyle: [],
  conflictResolution: [],
  householdChores: [],
  familyPlans: [],
  hasKids: [],
  pets: [],
  educationLevel: [],
  interests: [],
  bodyType: [],
  tattoos: [],
  piercings: [],
  verifiedOnly: false,
  activeRecently: false,
  dealbreakers: [],
};

// ─── Option Lists ──────────────────────────────────────────────────────────────

const OPTS = {
  sexualOrientation: ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Asexual", "Demisexual", "Queer", "Fluid", "Prefer not to say"],
  ethnicity: ["Asian", "Black / African American", "Hispanic / Latino", "Middle Eastern", "Native American", "Pacific Islander", "White / Caucasian", "Mixed", "Other", "Prefer not to say"],
  datingGoals: ["Marriage", "Long-term relationship", "Short-term dating", "Casual", "New friends", "Not sure yet"],
  intimacyPreferences: ["Waiting until marriage", "Celibate", "Abstinent", "Prefer emotional connection first"],
  smokingFreq: ["Never", "Socially", "Regularly", "Daily"],
  drinking: ["Never", "Socially", "Regularly", "Sober"],
  fitness: ["Every day", "Several times a week", "Weekly", "Rarely", "Never"],
  diet: ["Omnivore", "Vegetarian", "Vegan", "Pescatarian", "Keto", "Paleo", "Halal", "Kosher", "Gluten-free"],
  personalityType: ["Introvert", "Extrovert", "Ambivert", "Type A", "Type B", "Free Spirit", "Homebody", "Adventurer", "Analytical", "Creative", "Empathetic", "Leader"],
  zodiac: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  religion: ["Agnostic", "Atheist", "Buddhist", "Catholic", "Christian", "Centrist", "Hindu", "Jewish", "Muslim", "Sikh", "Spiritual"],
  politicalViews: ["Liberal", "Progressive", "Moderate", "Conservative", "Libertarian", "Apolitical", "Other", "Prefer not to say"],
  communicationStyle: ["Heavy texter", "Occasional texter", "Phone calls", "Voice notes", "Video calls", "In person"],
  conflictResolution: ["Discuss right away", "Cool down first", "Need personal space", "Work it out together", "Seek compromise", "Avoid conflict", "Prefer mediation"],
  householdChores: ["Cooking", "Love to clean", "Laundry", "Split things evenly", "Comfortable hiring help"],
  familyPlans: ["Want children", "Open to children", "Don't want children", "Want more children", "Don't want more children", "Not sure"],
  hasKids: ["No kids", "Kids (live with me)", "Kids (don't live with me)", "Prefer not to say"],
  pets: ["Dog person", "Cat person", "Love all animals", "Fish / reptiles", "Small animals", "No pets", "Allergic to pets", "Open to getting pets"],
  educationLevel: ["High School", "Some College", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "Doctoral / PhD", "Trade / Vocational", "Currently studying"],
  interests: ["Travel", "Coffee", "Music", "Cooking", "Yoga", "Hiking", "Art", "Photography", "Fitness", "Reading", "Gaming", "Film", "Dancing", "Outdoors", "Fashion", "Wine"],
  bodyType: ["Slim", "Athletic", "Average", "Curvy", "Muscular", "Plus-size", "Stocky", "Prefer not to say"],
  tattoos: ["None", "One", "A few", "Several", "Heavily tattooed"],
  piercings: ["None", "A few", "Multiple"],
};

const US_CITIES = [
  "Albuquerque, NM", "Atlanta, GA", "Austin, TX", "Baltimore, MD", "Baton Rouge, LA",
  "Boston, MA", "Buffalo, NY", "Charlotte, NC", "Chicago, IL", "Cincinnati, OH",
  "Columbus, OH", "Dallas, TX", "Denver, CO", "Detroit, MI", "Durham, NC",
  "El Paso, TX", "Fort Worth, TX", "Fresno, CA", "Greensboro, NC", "Henderson, NV",
  "Houston, TX", "Indianapolis, IN", "Irvine, CA", "Jacksonville, FL", "Kansas City, MO",
  "Las Vegas, NV", "Lexington, KY", "Lincoln, NE", "Long Beach, CA", "Los Angeles, CA",
  "Louisville, KY", "Madison, WI", "Memphis, TN", "Mesa, AZ", "Miami, FL",
  "Milwaukee, WI", "Minneapolis, MN", "Nashville, TN", "New Orleans, LA", "New York, NY",
  "Newark, NJ", "Oklahoma City, OK", "Omaha, NE", "Orlando, FL", "Philadelphia, PA",
  "Phoenix, AZ", "Pittsburgh, PA", "Plano, TX", "Portland, OR", "Raleigh, NC",
  "Reno, NV", "Sacramento, CA", "San Antonio, TX", "San Diego, CA", "San Francisco, CA",
  "San Jose, CA", "Scottsdale, AZ", "Seattle, WA", "St. Louis, MO", "St. Paul, MN",
  "Tampa, FL", "Tucson, AZ", "Tulsa, OK", "Virginia Beach, VA", "Washington, DC",
];

const toFeetIn = (inches: number) => `${Math.floor(inches / 12)}'${inches % 12}"`;

// ─── State Abbreviations (for GPS reverse geocode) ─────────────────────────
const STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO",
  Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI",
  "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY", "District of Columbia": "DC",
};

// ─── ZIP → City lookup (major US zip codes) ────────────────────────────────
const ZIP_LOOKUP: Record<string, string> = {
  "10001": "New York, NY", "10019": "New York, NY", "10036": "New York, NY",
  "90001": "Los Angeles, CA", "90024": "Los Angeles, CA", "90210": "Los Angeles, CA",
  "60601": "Chicago, IL", "60614": "Chicago, IL", "60657": "Chicago, IL",
  "77001": "Houston, TX", "77002": "Houston, TX", "77005": "Houston, TX",
  "85001": "Phoenix, AZ", "85004": "Phoenix, AZ", "85016": "Phoenix, AZ",
  "19101": "Philadelphia, PA", "19103": "Philadelphia, PA",
  "78201": "San Antonio, TX", "78205": "San Antonio, TX",
  "92101": "San Diego, CA", "92103": "San Diego, CA",
  "75201": "Dallas, TX", "75202": "Dallas, TX", "75205": "Dallas, TX",
  "95101": "San Jose, CA", "95110": "San Jose, CA",
  "78701": "Austin, TX", "78702": "Austin, TX", "78704": "Austin, TX",
  "79901": "El Paso, TX", "79902": "El Paso, TX",
  "32201": "Jacksonville, FL", "32204": "Jacksonville, FL",
  "27601": "Raleigh, NC", "27605": "Raleigh, NC",
  "28201": "Charlotte, NC", "28202": "Charlotte, NC",
  "30301": "Atlanta, GA", "30303": "Atlanta, GA", "30308": "Atlanta, GA",
  "98101": "Seattle, WA", "98102": "Seattle, WA", "98103": "Seattle, WA",
  "80201": "Denver, CO", "80202": "Denver, CO", "80203": "Denver, CO",
  "33101": "Miami, FL", "33125": "Miami, FL", "33130": "Miami, FL",
  "55401": "Minneapolis, MN", "55402": "Minneapolis, MN", "55403": "Minneapolis, MN",
  "55101": "St. Paul, MN", "55102": "St. Paul, MN",
  "63101": "St. Louis, MO", "63102": "St. Louis, MO",
  "64101": "Kansas City, MO", "64102": "Kansas City, MO",
  "74101": "Tulsa, OK", "74103": "Tulsa, OK",
  "73101": "Oklahoma City, OK", "73102": "Oklahoma City, OK",
  "85701": "Tucson, AZ", "85705": "Tucson, AZ",
  "94102": "San Francisco, CA", "94103": "San Francisco, CA", "94110": "San Francisco, CA",
  "94601": "Oakland, CA", "94609": "Oakland, CA",
  "95814": "Sacramento, CA", "95816": "Sacramento, CA",
  "90801": "Long Beach, CA", "90802": "Long Beach, CA",
  "92618": "Irvine, CA", "92620": "Irvine, CA",
  "93701": "Fresno, CA", "93702": "Fresno, CA",
  "85251": "Scottsdale, AZ", "85255": "Scottsdale, AZ",
  "85201": "Mesa, AZ", "85202": "Mesa, AZ",
  "89101": "Las Vegas, NV", "89102": "Las Vegas, NV", "89109": "Las Vegas, NV",
  "89501": "Reno, NV", "89502": "Reno, NV",
  "89002": "Henderson, NV", "89014": "Henderson, NV",
  "97201": "Portland, OR", "97202": "Portland, OR", "97209": "Portland, OR",
  "53201": "Milwaukee, WI", "53202": "Milwaukee, WI",
  "53703": "Madison, WI", "53711": "Madison, WI",
  "68501": "Lincoln, NE", "68502": "Lincoln, NE",
  "68101": "Omaha, NE", "68102": "Omaha, NE",
  "40201": "Louisville, KY", "40202": "Louisville, KY",
  "40502": "Lexington, KY", "40503": "Lexington, KY",
  "38101": "Memphis, TN", "38103": "Memphis, TN",
  "37201": "Nashville, TN", "37203": "Nashville, TN",
  "48201": "Detroit, MI", "48202": "Detroit, MI",
  "43201": "Columbus, OH", "43202": "Columbus, OH",
  "45201": "Cincinnati, OH", "45202": "Cincinnati, OH",
  "46201": "Indianapolis, IN", "46202": "Indianapolis, IN",
  "15201": "Pittsburgh, PA", "15203": "Pittsburgh, PA",
  "21201": "Baltimore, MD", "21202": "Baltimore, MD",
  "20001": "Washington, DC", "20002": "Washington, DC", "20036": "Washington, DC",
  "07101": "Newark, NJ", "07102": "Newark, NJ",
  "14201": "Buffalo, NY", "14202": "Buffalo, NY",
  "27701": "Durham, NC", "27703": "Durham, NC",
  "27401": "Greensboro, NC", "27403": "Greensboro, NC",
  "23501": "Virginia Beach, VA", "23502": "Virginia Beach, VA",
  "70112": "New Orleans, LA", "70113": "New Orleans, LA",
  "70801": "Baton Rouge, LA", "70802": "Baton Rouge, LA",
  "33601": "Tampa, FL", "33602": "Tampa, FL",
  "32801": "Orlando, FL", "32803": "Orlando, FL",
  "76101": "Fort Worth, TX", "76102": "Fort Worth, TX",
  "75024": "Plano, TX", "75025": "Plano, TX",
  "02101": "Boston, MA", "02110": "Boston, MA", "02116": "Boston, MA",
  "87101": "Albuquerque, NM", "87102": "Albuquerque, NM",
  "21401": "Annapolis, MD",
  "35201": "Birmingham, AL", "35203": "Birmingham, AL",
  "80901": "Colorado Springs, CO", "80903": "Colorado Springs, CO",
  "32501": "Pensacola, FL",
  "33901": "Fort Myers, FL",
  "91101": "Pasadena, CA",
  "91201": "Glendale, CA",
  "94301": "Palo Alto, CA",
  "94401": "San Mateo, CA",
  "94501": "Alameda, CA",
  "94704": "Berkeley, CA",
  "95003": "Aptos, CA",
  "96801": "Honolulu, HI", "96813": "Honolulu, HI",
  "99501": "Anchorage, AK", "99503": "Anchorage, AK",
};

// ─── Active Count ──────────────────────────────────────────────────────────────

export function getActiveFilterCount(f: DiscoverFilters): number {
  let n = 0;
  if (!f.lookingFor.includes("Everyone") || f.lookingFor.length !== 1) n++;
  if (f.ageMin !== DEFAULT_FILTERS.ageMin || f.ageMax !== DEFAULT_FILTERS.ageMax) n++;
  if (f.maxDistance !== DEFAULT_FILTERS.maxDistance) n++;
  if (f.useCurrentLocation || f.locationCity) n++;
  if (f.sexualOrientation.length) n++;
  if (f.ethnicity.length) n++;
  if (f.heightMin !== DEFAULT_FILTERS.heightMin || f.heightMax !== DEFAULT_FILTERS.heightMax) n++;
  if (f.datingGoals.length) n++;
  if (f.intimacyPreferences.length) n++;
  if (f.smokingMarijuana.length || f.smokingCigarettes.length || f.smokingHookah.length || f.smokingVaping.length) n++;
  if (f.drinking.length) n++;
  if (f.fitness.length) n++;
  if (f.diet.length) n++;
  if (f.personalityType.length) n++;
  if (f.zodiac.length) n++;
  if (f.religion.length) n++;
  if (f.politicalViews.length) n++;
  if (f.communicationStyle.length) n++;
  if (f.conflictResolution.length) n++;
  if (f.householdChores.length) n++;
  if (f.familyPlans.length) n++;
  if (f.hasKids.length) n++;
  if (f.pets.length) n++;
  if (f.educationLevel.length) n++;
  if (f.interests.length) n++;
  if (f.bodyType.length) n++;
  if (f.tattoos.length) n++;
  if (f.piercings.length) n++;
  if (f.verifiedOnly) n++;
  if (f.activeRecently) n++;
  return n;
}

// ─── Range Slider ──────────────────────────────────────────────────────────────

interface RangeSliderProps {
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  step?: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  colors: any;
  formatValue?: (v: number) => string;
}

function RangeSlider({ minValue, maxValue, min, max, step = 1, onChangeMin, onChangeMax, colors, formatValue }: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(280);
  const twRef = useRef(280);
  const minPRef = useRef(0);
  const maxPRef = useRef(280);
  const minStartRef = useRef(0);
  const maxStartRef = useRef(280);

  const toPos = (v: number, tw: number) => ((v - min) / (max - min)) * tw;
  const toVal = (pos: number, tw: number) => {
    const raw = min + (pos / tw) * (max - min);
    return Math.max(min, Math.min(max, Math.round(raw / step) * step));
  };

  const minPos = toPos(minValue, trackWidth);
  const maxPos = toPos(maxValue, trackWidth);

  useEffect(() => { minPRef.current = minPos; }, [minPos]);
  useEffect(() => { maxPRef.current = maxPos; }, [maxPos]);
  useEffect(() => { twRef.current = trackWidth; }, [trackWidth]);

  const minPR = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { minStartRef.current = minPRef.current; },
    onPanResponderMove: (_, g) => {
      const tw = twRef.current;
      const newPos = Math.max(0, Math.min(minStartRef.current + g.dx, maxPRef.current - MIN_GAP));
      onChangeMin(toVal(newPos, tw));
    },
  })).current;

  const maxPR = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { maxStartRef.current = maxPRef.current; },
    onPanResponderMove: (_, g) => {
      const tw = twRef.current;
      const newPos = Math.max(minPRef.current + MIN_GAP, Math.min(maxStartRef.current + g.dx, tw));
      onChangeMax(toVal(newPos, tw));
    },
  })).current;

  const fmt = formatValue ?? String;

  return (
    <View style={styles.rangeWrap}>
      <View style={styles.rangeLabels}>
        <View style={[styles.rangeTag, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.rangeTagText, { color: colors.foreground }]}>{fmt(minValue)}</Text>
        </View>
        <View style={[styles.rangeDash, { backgroundColor: colors.border }]} />
        <View style={[styles.rangeTag, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.rangeTagText, { color: colors.foreground }]}>{fmt(maxValue)}</Text>
        </View>
      </View>
      <View
        style={{ height: SLIDER_H, position: "relative" }}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <View style={[styles.sliderTrack, { backgroundColor: colors.secondary }]} />
        <View style={[styles.sliderFill, { left: minPos, width: maxPos - minPos, backgroundColor: colors.primary }]} />
        <View
          style={[styles.sliderThumb, { left: minPos - THUMB / 2, backgroundColor: colors.primary, borderColor: colors.background }]}
          {...minPR.panHandlers}
        />
        <View
          style={[styles.sliderThumb, { left: maxPos - THUMB / 2, backgroundColor: colors.primary, borderColor: colors.background }]}
          {...maxPR.panHandlers}
        />
      </View>
    </View>
  );
}

// ─── Single Slider (distance) ──────────────────────────────────────────────────

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  colors: any;
}

function SliderControl({ value, min, max, step = 1, onChange, colors }: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(280);
  const twRef = useRef(280);
  const posRef = useRef(0);
  const startRef = useRef(0);

  const pos = trackWidth > 0 ? ((value - min) / (max - min)) * trackWidth : 0;
  useEffect(() => { posRef.current = pos; }, [pos]);
  useEffect(() => { twRef.current = trackWidth; }, [trackWidth]);

  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startRef.current = posRef.current; },
    onPanResponderMove: (_, g) => {
      const tw = twRef.current;
      const newPos = Math.max(0, Math.min(startRef.current + g.dx, tw));
      const raw = min + (newPos / tw) * (max - min);
      onChange(Math.max(min, Math.min(max, Math.round(raw / step) * step)));
    },
  })).current;

  return (
    <View
      style={{ height: SLIDER_H, position: "relative" }}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.sliderTrack, { backgroundColor: colors.secondary }]} />
      <View style={[styles.sliderFill, { width: pos, backgroundColor: colors.primary }]} />
      <View
        style={[styles.sliderThumb, { left: pos - THUMB / 2, backgroundColor: colors.primary, borderColor: colors.background }]}
        {...pr.panHandlers}
      />
    </View>
  );
}

// ─── Chip Select ──────────────────────────────────────────────────────────────

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  colors: any;
}

function ChipSelect({ options, selected, onToggle, colors }: ChipSelectProps) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const sel = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(opt); }}
            style={[styles.chip, { backgroundColor: sel ? colors.primary : colors.secondary, borderColor: sel ? colors.primary : colors.border }]}
            activeOpacity={0.75}
          >
            {sel && <Feather name="check" size={11} color={colors.primaryForeground} />}
            <Text style={[styles.chipText, { color: sel ? colors.primaryForeground : colors.foreground }]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Dealbreaker Toggle ───────────────────────────────────────────────────────

function DealBreakerToggle({ filterKey, dealbreakers, onToggle, colors }: {
  filterKey: string;
  dealbreakers: string[];
  onToggle: (key: string) => void;
  colors: any;
}) {
  const active = dealbreakers.includes(filterKey);
  return (
    <TouchableOpacity
      style={styles.dbRow}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(filterKey); }}
      activeOpacity={0.7}
    >
      <View style={[styles.dbCheckbox, { backgroundColor: active ? colors.accent : "transparent", borderColor: active ? colors.accent : colors.border }]}>
        {active && <Feather name="check" size={10} color="#fff" />}
      </View>
      <Text style={[styles.dbLabel, { color: active ? colors.accent : colors.mutedForeground }]}>
        Dealbreaker
      </Text>
      {active && (
        <View style={[styles.dbBadge, { backgroundColor: colors.accent + "22" }]}>
          <Text style={[styles.dbBadgeText, { color: colors.accent }]}>Must match</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Filter Section ───────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  filterKey?: string;
  dealbreakers?: string[];
  onToggleDB?: (key: string) => void;
  colors: any;
  children: React.ReactNode;
}

function FilterSection({ title, subtitle, badge, filterKey, dealbreakers, onToggleDB, colors, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
          {subtitle && <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
        </View>
        {badge !== undefined && (
          <View style={[styles.valueTag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.valueTagText, { color: colors.foreground }]}>{badge}</Text>
          </View>
        )}
      </View>
      {children}
      {filterKey && dealbreakers && onToggleDB && (
        <DealBreakerToggle filterKey={filterKey} dealbreakers={dealbreakers} onToggle={onToggleDB} colors={colors} />
      )}
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

function GroupHeader({ icon, label, colors }: { icon: string; label: string; colors: any }) {
  return (
    <View style={[styles.groupHeader, { backgroundColor: colors.secondary }]}>
      <Feather name={icon as any} size={13} color={colors.mutedForeground} />
      <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface FilterModalProps {
  visible: boolean;
  filters: DiscoverFilters;
  onApply: (f: DiscoverFilters) => void;
  onClose: () => void;
  colors: any;
}

export function FilterModal({ visible, filters, onApply, onClose, colors }: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const [local, setLocal] = useState<DiscoverFilters>(filters);
  const [locationSearch, setLocationSearch] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "found" | "denied" | "error">("idle");
  const [gpsCity, setGpsCity] = useState("");

  useEffect(() => {
    if (visible) {
      setLocal(filters);
      setLocationSearch("");
      setGpsStatus(filters.useCurrentLocation ? "found" : "idle");
      setGpsCity(filters.useCurrentLocation ? filters.locationCity : "");
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 260 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 280, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleLocationToggle = async (v: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (v) {
      setLocal((p) => ({ ...p, useCurrentLocation: true, locationCity: "" }));
      setLocationSearch("");
      setGpsStatus("loading");
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setGpsStatus("denied");
          setLocal((p) => ({ ...p, useCurrentLocation: false }));
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const geocode = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        if (geocode.length > 0) {
          const { city, region } = geocode[0];
          const abbr = region ? (STATE_ABBR[region] ?? region) : "";
          const cityName = city ? (abbr ? `${city}, ${abbr}` : city) : "Current Location";
          setGpsCity(cityName);
          setLocal((p) => ({ ...p, locationCity: cityName }));
          setGpsStatus("found");
        } else {
          setGpsStatus("error");
          setLocal((p) => ({ ...p, useCurrentLocation: false }));
        }
      } catch {
        setGpsStatus("error");
        setLocal((p) => ({ ...p, useCurrentLocation: false }));
      }
    } else {
      setLocal((p) => ({ ...p, useCurrentLocation: false, locationCity: "" }));
      setGpsCity("");
      setGpsStatus("idle");
    }
  };

  const toggle = (key: keyof DiscoverFilters, value: string) => {
    const arr = local[key] as string[];
    setLocal((p) => ({ ...p, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }));
  };

  const toggleDB = (key: string) => {
    setLocal((p) => ({
      ...p,
      dealbreakers: p.dealbreakers.includes(key)
        ? p.dealbreakers.filter((k) => k !== key)
        : [...p.dealbreakers, key],
    }));
  };

  const toggleLookingFor = (opt: LookingForOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocal((p) => ({
      ...p,
      lookingFor: toggleLookingForSelection(p.lookingFor, opt),
    }));
  };

  const activeCount = getActiveFilterCount(local);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  // Resolve city/zip search results
  const isZip = /^\d{5}$/.test(locationSearch.trim());
  const filteredLocationCities = locationSearch.length > 0
    ? isZip
      ? (ZIP_LOOKUP[locationSearch.trim()] ? [ZIP_LOOKUP[locationSearch.trim()]] : [])
      : US_CITIES.filter((c) => c.toLowerCase().includes(locationSearch.toLowerCase()))
    : [];

  const handleReset = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLocal(DEFAULT_FILTERS); };
  const handleApply = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onApply(local); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={[styles.resetText, { color: colors.mutedForeground }]}>Reset all</Text>
          </TouchableOpacity>
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
            Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 110 }]}>

          {/* ── Who You're Looking For ── */}
          <GroupHeader icon="users" label="WHO YOU'RE LOOKING FOR" colors={colors} />

          <FilterSection title="Show Me" subtitle="Gender identity of profiles to show" filterKey="lookingFor" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <View style={styles.chipRow}>
              {LOOKING_FOR_OPTIONS.map((opt) => {
                const sel = opt === "Everyone" ? local.lookingFor.includes("Everyone") : local.lookingFor.includes(opt) && !local.lookingFor.includes("Everyone");
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => toggleLookingFor(opt)}
                    style={[styles.chip, { backgroundColor: sel ? colors.primary : colors.secondary, borderColor: sel ? colors.primary : colors.border }]}
                    activeOpacity={0.75}
                  >
                    {sel && <Feather name="check" size={11} color={colors.primaryForeground} />}
                    <Text style={[styles.chipText, { color: sel ? colors.primaryForeground : colors.foreground }]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Sexual Orientation" filterKey="sexualOrientation" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.sexualOrientation} selected={local.sexualOrientation} onToggle={(v) => toggle("sexualOrientation", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection
            title="Age Range"
            filterKey="ageRange"
            dealbreakers={local.dealbreakers}
            onToggleDB={toggleDB}
            colors={colors}
          >
            <RangeSlider
              minValue={local.ageMin}
              maxValue={local.ageMax}
              min={18}
              max={65}
              onChangeMin={(v) => setLocal((p) => ({ ...p, ageMin: v }))}
              onChangeMax={(v) => setLocal((p) => ({ ...p, ageMax: v }))}
              colors={colors}
            />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Ethnicity" subtitle="Select all that apply" filterKey="ethnicity" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.ethnicity} selected={local.ethnicity} onToggle={(v) => toggle("ethnicity", v)} colors={colors} />
          </FilterSection>

          {/* ── Location & Distance ── */}
          <GroupHeader icon="map-pin" label="LOCATION & DISTANCE" colors={colors} />

          <View style={styles.section}>

            {/* Use My Location toggle */}
            <View style={styles.toggleRow}>
              <View style={[styles.toggleIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="navigation" size={15} color={gpsStatus === "found" ? colors.primary : colors.foreground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Use My Location</Text>
                <Text style={[styles.toggleSub, { color: gpsStatus === "denied" || gpsStatus === "error" ? "#FF4057" : colors.mutedForeground }]}>
                  {gpsStatus === "loading" ? "Getting your location…"
                    : gpsStatus === "found" ? gpsCity
                    : gpsStatus === "denied" ? "Location permission denied"
                    : gpsStatus === "error" ? "Couldn't get location — try again"
                    : "Detect and use your current city"}
                </Text>
              </View>
              <Switch
                value={local.useCurrentLocation}
                onValueChange={handleLocationToggle}
                trackColor={{ false: colors.secondary, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {/* OR / manual search — only when GPS is off */}
            {!local.useCurrentLocation && (
              <>
                <View style={styles.locationOrRow}>
                  <View style={[styles.locationOrLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.locationOrText, { color: colors.mutedForeground }]}>or search by city / ZIP</Text>
                  <View style={[styles.locationOrLine, { backgroundColor: colors.border }]} />
                </View>

                {/* Search input */}
                <View style={[styles.searchWrap, { backgroundColor: colors.secondary, borderColor: local.locationCity ? colors.primary : colors.border }]}>
                  <Feather name="search" size={14} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.foreground }]}
                    placeholder="City name or ZIP code…"
                    placeholderTextColor={colors.mutedForeground}
                    value={locationSearch}
                    onChangeText={(t) => {
                      setLocationSearch(t);
                      if (local.locationCity) setLocal((p) => ({ ...p, locationCity: "" }));
                    }}
                    autoCapitalize="words"
                    keyboardType="default"
                  />
                  {(locationSearch.length > 0 || local.locationCity) && (
                    <TouchableOpacity onPress={() => { setLocationSearch(""); setLocal((p) => ({ ...p, locationCity: "" })); }}>
                      <Feather name="x" size={14} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Selected city pill */}
                {local.locationCity ? (
                  <View style={[styles.selectedCityRow, { backgroundColor: colors.secondary, borderColor: colors.primary }]}>
                    <Feather name="map-pin" size={14} color={colors.primary} />
                    <Text style={[styles.selectedCityText, { color: colors.foreground, flex: 1 }]}>{local.locationCity}</Text>
                    <TouchableOpacity onPress={() => { setLocal((p) => ({ ...p, locationCity: "" })); setLocationSearch(""); }}>
                      <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                ) : locationSearch.length > 0 ? (
                  <View style={styles.cityList}>
                    {filteredLocationCities.slice(0, 8).map((city) => (
                      <TouchableOpacity
                        key={city}
                        onPress={() => {
                          setLocal((p) => ({ ...p, locationCity: city }));
                          setLocationSearch("");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.cityRow, { borderBottomColor: colors.border }]}
                        activeOpacity={0.6}
                      >
                        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.cityText, { color: colors.foreground }]}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                    {filteredLocationCities.length === 0 && (
                      <Text style={[styles.cityEmpty, { color: colors.mutedForeground }]}>
                        {isZip ? `ZIP code "${locationSearch}" not found` : `No cities matching "${locationSearch}"`}
                      </Text>
                    )}
                  </View>
                ) : null}
              </>
            )}

            {/* Max Distance slider — always visible */}
            <View style={[styles.innerDivider, { backgroundColor: colors.border, marginLeft: 0, marginVertical: 8 }]} />
            <View style={styles.distanceLabelRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Maximum Distance</Text>
              <View style={[styles.valueTag, { backgroundColor: colors.secondary, marginTop: 0 }]}>
                <Text style={[styles.valueTagText, { color: colors.foreground }]}>
                  {local.maxDistance >= 100 ? "Anywhere" : `${local.maxDistance} mi`}
                </Text>
              </View>
            </View>
            <SliderControl value={local.maxDistance} min={1} max={100} step={5} onChange={(v) => setLocal((p) => ({ ...p, maxDistance: v }))} colors={colors} />
            <View style={styles.distanceEndRow}>
              <Text style={[styles.sliderEndLabel, { color: colors.mutedForeground }]}>1 mi</Text>
              <Text style={[styles.sliderEndLabel, { color: colors.mutedForeground }]}>Anywhere</Text>
            </View>

            <DealBreakerToggle filterKey="location" dealbreakers={local.dealbreakers} onToggle={toggleDB} colors={colors} />

          </View>

          {/* ── Physical ── */}
          <GroupHeader icon="activity" label="PHYSICAL ATTRIBUTES" colors={colors} />

          <FilterSection
            title="Height Range"
            filterKey="heightRange"
            dealbreakers={local.dealbreakers}
            onToggleDB={toggleDB}
            colors={colors}
          >
            <RangeSlider
              minValue={local.heightMin}
              maxValue={local.heightMax}
              min={48}
              max={84}
              onChangeMin={(v) => setLocal((p) => ({ ...p, heightMin: v }))}
              onChangeMax={(v) => setLocal((p) => ({ ...p, heightMax: v }))}
              colors={colors}
              formatValue={toFeetIn}
            />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Body Type" filterKey="bodyType" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.bodyType} selected={local.bodyType} onToggle={(v) => toggle("bodyType", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Tattoos" filterKey="tattoos" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.tattoos} selected={local.tattoos} onToggle={(v) => toggle("tattoos", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Piercings" filterKey="piercings" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.piercings} selected={local.piercings} onToggle={(v) => toggle("piercings", v)} colors={colors} />
          </FilterSection>

          {/* ── Dating Goals ── */}
          <GroupHeader icon="heart" label="DATING GOALS" colors={colors} />

          <FilterSection title="What they're looking for" filterKey="datingGoals" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.datingGoals} selected={local.datingGoals} onToggle={(v) => toggle("datingGoals", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Intimacy Preferences" filterKey="intimacyPreferences" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.intimacyPreferences} selected={local.intimacyPreferences} onToggle={(v) => toggle("intimacyPreferences", v)} colors={colors} />
          </FilterSection>

          {/* ── Habits ── */}
          <GroupHeader icon="coffee" label="HABITS" colors={colors} />

          <FilterSection title="Smoking" subtitle="Select habits for each type" colors={colors}>
            <View style={styles.smokingGrid}>
              {([
                { label: "Marijuana", key: "smokingMarijuana" as const },
                { label: "Cigarettes", key: "smokingCigarettes" as const },
                { label: "Hookah", key: "smokingHookah" as const },
                { label: "Vaping", key: "smokingVaping" as const },
              ]).map((item, idx, arr) => (
                <View key={item.key}>
                  <Text style={[styles.smokingSubLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                  <ChipSelect options={OPTS.smokingFreq} selected={local[item.key]} onToggle={(v) => toggle(item.key, v)} colors={colors} />
                  <DealBreakerToggle filterKey={item.key} dealbreakers={local.dealbreakers} onToggle={toggleDB} colors={colors} />
                  {idx < arr.length - 1 && <View style={[styles.smokingDivider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Drinking" filterKey="drinking" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.drinking} selected={local.drinking} onToggle={(v) => toggle("drinking", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Fitness" subtitle="How often they work out" filterKey="fitness" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.fitness} selected={local.fitness} onToggle={(v) => toggle("fitness", v)} colors={colors} />
          </FilterSection>

          {/* ── Diet ── */}
          <GroupHeader icon="list" label="DIET" colors={colors} />

          <FilterSection title="Eating Habits" filterKey="diet" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.diet} selected={local.diet} onToggle={(v) => toggle("diet", v)} colors={colors} />
          </FilterSection>

          {/* ── Personality & Values ── */}
          <GroupHeader icon="sun" label="PERSONALITY & VALUES" colors={colors} />

          <FilterSection title="Personality Type" filterKey="personalityType" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.personalityType} selected={local.personalityType} onToggle={(v) => toggle("personalityType", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Zodiac Sign" filterKey="zodiac" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.zodiac} selected={local.zodiac} onToggle={(v) => toggle("zodiac", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Religion" filterKey="religion" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.religion} selected={local.religion} onToggle={(v) => toggle("religion", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Political Views" filterKey="politicalViews" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.politicalViews} selected={local.politicalViews} onToggle={(v) => toggle("politicalViews", v)} colors={colors} />
          </FilterSection>

          {/* ── Communication ── */}
          <GroupHeader icon="message-circle" label="COMMUNICATION" colors={colors} />

          <FilterSection title="Communication Style" filterKey="communicationStyle" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.communicationStyle} selected={local.communicationStyle} onToggle={(v) => toggle("communicationStyle", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Conflict Resolution" filterKey="conflictResolution" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.conflictResolution} selected={local.conflictResolution} onToggle={(v) => toggle("conflictResolution", v)} colors={colors} />
          </FilterSection>

          {/* ── Home & Family ── */}
          <GroupHeader icon="home" label="HOME & FAMILY" colors={colors} />

          <FilterSection title="Household Chores" filterKey="householdChores" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.householdChores} selected={local.householdChores} onToggle={(v) => toggle("householdChores", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Family Plans" filterKey="familyPlans" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.familyPlans} selected={local.familyPlans} onToggle={(v) => toggle("familyPlans", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Has Kids" filterKey="hasKids" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.hasKids} selected={local.hasKids} onToggle={(v) => toggle("hasKids", v)} colors={colors} />
          </FilterSection>
          <Divider colors={colors} />

          <FilterSection title="Pets" filterKey="pets" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.pets} selected={local.pets} onToggle={(v) => toggle("pets", v)} colors={colors} />
          </FilterSection>

          {/* ── Education ── */}
          <GroupHeader icon="book" label="EDUCATION" colors={colors} />

          <FilterSection title="Education Level" filterKey="educationLevel" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.educationLevel} selected={local.educationLevel} onToggle={(v) => toggle("educationLevel", v)} colors={colors} />
          </FilterSection>

          {/* ── Interests ── */}
          <GroupHeader icon="star" label="SHARED INTERESTS" colors={colors} />

          <FilterSection title="Interests" subtitle="Only show people who share these" filterKey="interests" dealbreakers={local.dealbreakers} onToggleDB={toggleDB} colors={colors}>
            <ChipSelect options={OPTS.interests} selected={local.interests} onToggle={(v) => toggle("interests", v)} colors={colors} />
          </FilterSection>

          {/* ── Profile Quality ── */}
          <GroupHeader icon="shield" label="PROFILE QUALITY" colors={colors} />

          <View style={styles.section}>
            {([
              { key: "verifiedOnly" as const, dbKey: "verifiedOnly", icon: "check-circle", label: "Verified profiles only", sub: "People who have verified their identity" },
              { key: "activeRecently" as const, dbKey: "activeRecently", icon: "clock", label: "Active in last 7 days", sub: "People who opened the app recently" },
            ]).map((item, i, arr) => (
              <View key={item.key}>
                <View style={styles.toggleRow}>
                  <View style={[styles.toggleIcon, { backgroundColor: colors.secondary }]}>
                    <Feather name={item.icon as any} size={15} color={colors.foreground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={local[item.key] as boolean}
                    onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocal((p) => ({ ...p, [item.key]: v })); }}
                    trackColor={{ false: colors.secondary, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
                <DealBreakerToggle filterKey={item.dbKey} dealbreakers={local.dealbreakers} onToggle={toggleDB} colors={colors} />
                {i < arr.length - 1 && <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: bottomPad + 8, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleApply} style={[styles.applyBtn, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
            <Text style={[styles.applyText, { color: colors.primaryForeground }]}>
              Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    maxHeight: SCREEN_H * 0.94,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden",
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700" },
  resetText: { fontSize: 14 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4, marginHorizontal: -20 },
  groupLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  content: { paddingHorizontal: 20 },
  section: { paddingVertical: 18, gap: 12 },
  sectionRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionSub: { fontSize: 12, marginTop: 2 },
  valueTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginTop: 2 },
  valueTagText: { fontSize: 13, fontWeight: "700" },
  divider: { height: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 22, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "500" },
  // Range slider
  rangeWrap: { gap: 10 },
  rangeLabels: { flexDirection: "row", alignItems: "center", gap: 8 },
  rangeTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  rangeTagText: { fontSize: 13, fontWeight: "700" },
  rangeDash: { flex: 1, height: 1 },
  sliderTrack: { position: "absolute", top: TRACK_TOP, left: 0, right: 0, height: 4, borderRadius: 2 },
  sliderFill: { position: "absolute", top: TRACK_TOP, height: 4, borderRadius: 2 },
  sliderThumb: { position: "absolute", top: THUMB_TOP, width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 3, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 4, elevation: 4 },
  // Distance slider
  distanceEndRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  sliderEndLabel: { fontSize: 11 },
  // Dealbreaker
  dbRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 4 },
  dbCheckbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  dbLabel: { fontSize: 13, fontWeight: "500" },
  dbBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  dbBadgeText: { fontSize: 11, fontWeight: "700" },
  // Smoking
  smokingGrid: { gap: 14 },
  smokingSubLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  smokingDivider: { height: 1, marginTop: 14 },
  // Location section
  locationOrRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationOrLine: { flex: 1, height: 1 },
  locationOrText: { fontSize: 12, fontWeight: "500" },
  selectedCityRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5 },
  selectedCityText: { fontSize: 14, fontWeight: "500" },
  distanceLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  // City picker
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 14 },
  cityList: { gap: 0 },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  cityText: { fontSize: 14 },
  cityEmpty: { fontSize: 13, paddingVertical: 12, textAlign: "center" },
  // Toggles
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 2 },
  toggleIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleLabel: { fontSize: 14, fontWeight: "500" },
  toggleSub: { fontSize: 12, marginTop: 1 },
  innerDivider: { height: 1, marginLeft: 46, marginVertical: 10 },
  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  applyBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  applyText: { fontSize: 16, fontWeight: "700" },
});
