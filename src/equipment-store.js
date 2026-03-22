export const EQUIPMENT_STORAGE_KEY = "pourover-journal-equipment-profiles";

function withTrimmedFallback(value, fallback) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export function buildEquipmentProfile(input) {
  return {
    id: input.id,
    name: withTrimmedFallback(input.name, "未命名组合"),
    dripper: withTrimmedFallback(input.dripper, "HARIO V60 02"),
    grinder: withTrimmedFallback(input.grinder, "Comandante C40"),
    filters: withTrimmedFallback(input.filters, "CAFEC Abaca 02"),
  };
}

export function initializeEquipmentState(serializedValue, defaults) {
  const defaultProfile = buildEquipmentProfile({
    id: "profile-1",
    name: "日常组合",
    dripper: defaults.dripper,
    grinder: defaults.grinder,
    filters: defaults.filters,
  });

  if (!serializedValue) {
    return {
      activeProfileId: defaultProfile.id,
      profiles: [defaultProfile],
    };
  }

  try {
    const parsed = JSON.parse(serializedValue);

    if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
      return {
        activeProfileId: parsed.activeProfileId || parsed.profiles[0].id,
        profiles: parsed.profiles.map((profile) => buildEquipmentProfile(profile)),
      };
    }

    return {
      activeProfileId: defaultProfile.id,
      profiles: [
        buildEquipmentProfile({
          id: defaultProfile.id,
          name: "日常组合",
          dripper: parsed.dripper || defaults.dripper,
          grinder: parsed.grinder || defaults.grinder,
          filters: parsed.filters || defaults.filters,
        }),
      ],
    };
  } catch {
    return {
      activeProfileId: defaultProfile.id,
      profiles: [defaultProfile],
    };
  }
}

export function updateEquipmentProfile(state, nextProfile) {
  return {
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === nextProfile.id ? buildEquipmentProfile(nextProfile) : profile
    ),
  };
}

export function setActiveEquipmentProfile(state, profileId) {
  return {
    ...state,
    activeProfileId: profileId,
  };
}

export function removeEquipmentProfile(state, profileId) {
  const remainingProfiles = state.profiles.filter(
    (profile) => profile.id !== profileId
  );

  if (remainingProfiles.length === 0) {
    return state;
  }

  return {
    activeProfileId:
      state.activeProfileId === profileId
        ? remainingProfiles[0].id
        : state.activeProfileId,
    profiles: remainingProfiles,
  };
}
