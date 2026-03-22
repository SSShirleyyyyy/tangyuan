const DRIPPER_PROFILES = {
  V60: {
    ratio: "1:16",
    waterTemp: "93C",
    grindBand: "medium-fine",
    pours: [
      { label: "Bloom", amount: "45g", time: "0:00-0:35" },
      { label: "Second Pour", amount: "120g", time: "0:35-1:05" },
      { label: "Final Pour", amount: "240g", time: "1:05-1:40" },
    ],
  },
  "Kalita Wave": {
    ratio: "1:15",
    waterTemp: "91C",
    grindBand: "medium",
    pours: [
      { label: "Bloom", amount: "50g", time: "0:00-0:35" },
      { label: "Main Pour", amount: "150g", time: "0:35-1:15" },
      { label: "Top Off", amount: "255g", time: "1:15-1:45" },
    ],
  },
};

const PREFERENCE_COPY = {
  clean_bright: {
    headline: "Bright and articulate cup",
    notes:
      "Lean into clarity with slightly higher temperature and a quicker finish.",
  },
  sweet_round: {
    headline: "Sweet and round comfort cup",
    notes:
      "Use a slightly tighter ratio to emphasize body and rounded sweetness.",
  },
};

const GRINDER_RANGES = {
  "Comandante C40": {
    "medium-fine": "22-24 clicks",
    medium: "24-26 clicks",
  },
  "1Zpresso ZP6": {
    "medium-fine": "4.3-4.7",
    medium: "4.8-5.2",
  },
};

export function formatGrindGuidance(grinder, grindBand) {
  const mappedRange = GRINDER_RANGES[grinder]?.[grindBand];
  return mappedRange ? `${grinder}: ${mappedRange}` : `${grinder}: ${grindBand}`;
}

export function buildSuggestion({ bean, equipment }) {
  const dripperProfile =
    DRIPPER_PROFILES[equipment.dripper] || DRIPPER_PROFILES.V60;
  const preference =
    PREFERENCE_COPY[equipment.tastePreference] || PREFERENCE_COPY.clean_bright;

  return {
    ratio: dripperProfile.ratio,
    waterTemp: dripperProfile.waterTemp,
    pours: dripperProfile.pours,
    headline: `${preference.headline} for ${bean.process.toLowerCase()} ${
      bean.roastLevel.toLowerCase()
    } roasts`,
    notes: `${preference.notes} Aim for ${bean.flavorFocus.toLowerCase()} while keeping body in balance.`,
    grindGuidance: formatGrindGuidance(
      equipment.grinder,
      dripperProfile.grindBand
    ),
  };
}
