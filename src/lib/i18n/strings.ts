type Language = "en" | "fr";

export const strings = {
  en: {
    audioCard: {
      countryFallback: "Burkina Faso",
      neighborhoodFallback: "nearby",
      now: "now",
      away: "away",
      listens: (count: number) =>
        count === 1 ? "1 listen" : `${count} listens`,
      reactWith: (emoji: string) => `React with ${emoji}`,
      townFallback: "around you",
      voiceFallbackTitle: "A voice from nearby",
      voiceFallbackTitleWithLocation: (location: string) =>
        `A voice from ${location}`,
    },
    categories: {
      all: "All",
      moments: "Moments",
      aroundYou: "Around You",
      momentsDescription: "Stories that make us laugh, feel, or say only here.",
      aroundYouDescription:
        "What is happening nearby. Info, alerts, tips and more.",
    },
    floatingMic: {
      feed: "Feed",
      myVoices: "My Voices",
      saved: "Saved",
      shareVoice: "Share your voice",
    },
    actions: {
      cancel: "Cancel",
      delete: "Delete",
      save: "Save",
      saved: "Saved",
    },
    feed: {
      emptyTitle: "No voices here yet",
      emptyBody: "Try another category or come back soon.",
    },
    myVoices: {
      emptyTitle: "No voices published yet",
      emptyBody: "The voices you publish will live here.",
      deleteVoice: "Delete voice",
      deleteVoiceTitle: "Delete voice?",
      deleteVoiceMessage: "This voice will be permanently removed.",
      deleteVoiceSuccess: "Voice deleted",
      deleteVoiceError: "Could not delete this voice. Try again.",
    },
    record: {
      title: "Share your voice",
      prompt: "What is happening around you?",
      holdToSpeak: "Hold to speak",
      listening: "Listening...",
      releaseToFinish: "Release to finish",
      releaseToPublish: "Release to publish",
      published: "Your voice is published",
      publish: "Publish",
      publishing: "Publishing...",
      publishError: "Could not publish. Try again.",
      playPreview: "Play preview",
      recordAgain: "Record again",
      replace: "Replace",
      voiceTitleLabel: "Give your voice a short title",
      voiceTitlePlaceholder: "What is happening nearby?",
      voiceTitleRequired: "Add a title before publishing.",
      voiceTitleTooShort: "Use at least 3 characters.",
      voiceTitleCharacterCount: (count: number, max: number) =>
        `${count} / ${max}`,
      discardRecordingTitle: "Discard recording?",
      discardRecordingMessage: "Your unpublished voice will be lost.",
      keepRecording: "Keep recording",
      discard: "Discard",
    },
    report: {
      reportVoice: "Report voice",
      reportVoiceTitle: "Report this voice",
      reportReason: "Reason",
      reportDetails: "Details",
      reportDetailsPlaceholder: "Add a short note",
      reportDetailsRequired: "Add a short explanation.",
      submitReport: "Submit report",
      reportSubmitted: "Thanks. Report submitted.",
      reportError: "Could not submit report. Try again.",
      alreadyReported: "Reported",
      reportReasonHarassment: "Harassment or bullying",
      reportReasonHate: "Hate speech",
      reportReasonViolence: "Violence or threats",
      reportReasonSexual: "Sexual content",
      reportReasonSpam: "Spam",
      reportReasonMisinformation: "False or misleading information",
      reportReasonOther: "Other",
    },
    saved: {
      loading: "Loading saved voices...",
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
      neighborhoodFallback: "tout pres",
      now: "maintenant",
      away: "d'ici",
      listens: (count: number) =>
        count === 1 ? "1 ecoute" : `${count} ecoutes`,
      reactWith: (emoji: string) => `Reagir avec ${emoji}`,
      townFallback: "autour de toi",
      voiceFallbackTitle: "Une voix des environs",
      voiceFallbackTitleWithLocation: (location: string) =>
        `Une voix de ${location}`,
    },
    categories: {
      all: "Tout",
      moments: "Moments",
      aroundYou: "Autour de toi",
      momentsDescription:
        "Des histoires qui font rire, ressentir, ou dire seulement ici.",
      aroundYouDescription:
        "Ce qui se passe tout pres. Infos, alertes, conseils et plus.",
    },
    floatingMic: {
      feed: "Fil",
      myVoices: "Mes voix",
      saved: "Sauvegardee",
      shareVoice: "Partage ta voix",
    },
    actions: {
      cancel: "Annuler",
      delete: "Supprimer",
      save: "Sauvegarder",
      saved: "Sauvegardee",
    },
    feed: {
      emptyTitle: "Aucune voix ici pour l'instant",
      emptyBody: "Essaie une autre categorie ou reviens bientot.",
    },
    myVoices: {
      emptyTitle: "Aucune voix publiee",
      emptyBody: "Les voix que tu publies vivront ici.",
      deleteVoice: "Supprimer la voix",
      deleteVoiceTitle: "Supprimer la voix ?",
      deleteVoiceMessage: "Cette voix sera supprimee definitivement.",
      deleteVoiceSuccess: "Voix supprimee",
      deleteVoiceError: "Impossible de supprimer cette voix. Reessaie.",
    },
    record: {
      title: "Partage ta voix",
      prompt: "Que se passe-t-il autour de vous ?",
      holdToSpeak: "Maintenez pour parler",
      listening: "A l'ecoute...",
      releaseToFinish: "Relachez pour terminer",
      releaseToPublish: "Relachez pour publier",
      published: "Ta voix est publiee",
      publish: "Publier",
      publishing: "Publication...",
      publishError: "Impossible de publier. Reessaie.",
      playPreview: "Ecouter l'apercu",
      recordAgain: "Recommencer",
      replace: "Remplacer",
      voiceTitleLabel: "Donne un titre court a ta voix",
      voiceTitlePlaceholder: "Que se passe-t-il pres d'ici ?",
      voiceTitleRequired: "Ajoute un titre avant de publier.",
      voiceTitleTooShort: "Utilise au moins 3 caracteres.",
      voiceTitleCharacterCount: (count: number, max: number) =>
        `${count} / ${max}`,
      discardRecordingTitle: "Abandonner l'enregistrement ?",
      discardRecordingMessage: "Votre voix non publiee sera perdue.",
      keepRecording: "Garder l'enregistrement",
      discard: "Abandonner",
    },
    report: {
      reportVoice: "Signaler la voix",
      reportVoiceTitle: "Signaler cette voix",
      reportReason: "Raison",
      reportDetails: "Details",
      reportDetailsPlaceholder: "Ajoute une courte note",
      reportDetailsRequired: "Ajoute une courte explication.",
      submitReport: "Envoyer le signalement",
      reportSubmitted: "Merci. Signalement envoye.",
      reportError: "Impossible d'envoyer le signalement. Reessaie.",
      alreadyReported: "Signalee",
      reportReasonHarassment: "Harcelement ou intimidation",
      reportReasonHate: "Discours haineux",
      reportReasonViolence: "Violence ou menaces",
      reportReasonSexual: "Contenu sexuel",
      reportReasonSpam: "Spam",
      reportReasonMisinformation: "Information fausse ou trompeuse",
      reportReasonOther: "Autre",
    },
    saved: {
      loading: "Chargement des voix sauvegardees...",
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
