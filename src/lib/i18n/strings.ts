type Language = "en" | "fr";

export const strings = {
  en: {
    audioCard: {
      countryFallback: "Burkina Faso",
      fallbackTranscript:
        "The degue near Creamiere does not taste right anymore...",
      neighborhoodFallback: "nearby",
      now: "now",
      townFallback: "around you",
    },
    categories: {
      social: "Social stories",
      security: "Alerts",
      vente: "Buy and sell",
    },
    floatingMic: {
      voices: "Voices",
      saved: "Saved",
      save: "Save",
      shareVoice: "Share your voice",
    },
    myVoices: {
      emptyTitle: "No voices published yet",
      emptyBody: "The voices you publish will live here.",
    },
    record: {
      title: "Share your voice",
      holdToSpeak: "Hold to speak",
      releaseToPublish: "Release to publish",
      published: "Your voice is published",
      replace: "Replace",
    },
    saved: {
      emptyTitle: "No saved voices",
      emptyBody: "The voices you want to find again will live here.",
    },
    toast: {
      voiceIsNowPartOf: "Your voice is now part of",
      place: "Hoboken",
      close: "Close",
    },
  },
  fr: {
    audioCard: {
      countryFallback: "Burkina Faso",
      fallbackTranscript:
        "La degue a cote de la Creamiere n'est plus bonne...",
      neighborhoodFallback: "tout pres",
      now: "maintenant",
      townFallback: "autour de toi",
    },
    categories: {
      social: "Social-contes",
      security: "Urgences",
      vente: "Vente-achats",
    },
    floatingMic: {
      voices: "Voix",
      saved: "Sauvegardee",
      save: "Sauvegarder",
      shareVoice: "Partage ta voix",
    },
    myVoices: {
      emptyTitle: "Aucune voix publiee",
      emptyBody: "Les voix que tu publies vivront ici.",
    },
    record: {
      title: "Partage ta voix",
      holdToSpeak: "Maintenez pour parler",
      releaseToPublish: "Relachez pour publier",
      published: "Ta voix est publiee",
      replace: "Remplacer",
    },
    saved: {
      emptyTitle: "Aucune voix sauvegardee",
      emptyBody: "Les voix que tu veux retrouver vivront ici.",
    },
    toast: {
      voiceIsNowPartOf: "Ta voix fait maintenant partie de",
      place: "Hoboken",
      close: "Fermer",
    },
  },
} as const;

function getDeviceLanguage(): Language {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const language = locale?.split("-")[0];

  return language === "fr" ? "fr" : "en";
}

function getDefaultLanguage(): Language {
  try {
    return getDeviceLanguage();
  } catch {
    return "en";
  }
}

export function getStrings(language: Language = getDefaultLanguage()) {
  return strings[language] ?? strings.en;
}

export type Strings = ReturnType<typeof getStrings>;
