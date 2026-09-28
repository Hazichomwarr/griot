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
      playVoice: "Play voice",
      pauseVoice: "Pause voice",
      townFallback: "around you",
    },
    categories: {
      all: "All",
      aroundYou: "Around You",
      contes: "Contes",
      contesDescription: "Short stories, legends and voices worth passing on.",
      aroundYouDescription:
        "What is happening nearby. Info, alerts, tips and more.",
    },
    floatingMic: {
      feed: "Feed",
      myVoices: "My Voices",
      record: "Record",
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
      swipeNext: "Swipe for next voice",
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
      tagline: "Real voices. A richer world.",
      prompt: "What's on your mind?",
      holdToSpeak: "Hold to speak",
      listening: "Listening...",
      releaseToFinish: "Release to finish",
      releaseToPublish: "Release to publish",
      published: "Your voice is published",
      publish: "Publish",
      publishing: "Publishing...",
      publishError: "Could not publish. Try again.",
      playPreview: "Play preview",
      pausePreview: "Pause preview",
      recordAgain: "Record again",
      replace: "Replace",
      voiceTitleLabel: "Add a title (optional)",
      voiceTitlePlaceholder: "A few words about your voice",
      voiceTitleTooShort: "Use at least 3 characters.",
      voiceTitleCharacterCount: (count: number, max: number) =>
        `${count} / ${max}`,
      contesDurationHint: "Up to 5 minutes",
      contesDurationTooLong:
        "A Conte can be up to 5 minutes. Record a shorter one or choose Around You.",
      discardRecordingTitle: "Discard recording?",
      discardRecordingMessage: "Your unpublished voice will be lost.",
      keepRecording: "Keep recording",
      discard: "Discard",
      supportMomentsTitle: "Real moments",
      supportMomentsBody: "Big or small",
      supportPerspectiveTitle: "Your perspective",
      supportPerspectiveBody: "Adds to your community",
      supportWorldTitle: "A richer world",
      supportWorldBody: "One voice at a time",
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
      playVoice: "Ecouter la voix",
      pauseVoice: "Mettre la voix en pause",
      townFallback: "autour de toi",
    },
    categories: {
      all: "Tout",
      aroundYou: "Autour de vous",
      contes: "Contes",
      contesDescription: "Histoires, légendes et voix à transmettre.",
      aroundYouDescription:
        "Ce qui se passe tout pres. Infos, alertes, conseils et plus.",
    },
    floatingMic: {
      feed: "Fil",
      myVoices: "Mes voix",
      record: "Enregistrer",
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
      swipeNext: "Glisse pour la voix suivante",
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
      tagline: "De vraies voix. Un monde plus riche.",
      prompt: "Qu'avez-vous en tete ?",
      holdToSpeak: "Maintenez pour parler",
      listening: "A l'ecoute...",
      releaseToFinish: "Relachez pour terminer",
      releaseToPublish: "Relachez pour publier",
      published: "Ta voix est publiee",
      publish: "Publier",
      publishing: "Publication...",
      publishError: "Impossible de publier. Reessaie.",
      playPreview: "Ecouter l'apercu",
      pausePreview: "Mettre l'apercu en pause",
      recordAgain: "Recommencer",
      replace: "Remplacer",
      voiceTitleLabel: "Ajouter un titre (facultatif)",
      voiceTitlePlaceholder: "Quelques mots sur votre voix",
      voiceTitleTooShort: "Utilise au moins 3 caracteres.",
      voiceTitleCharacterCount: (count: number, max: number) =>
        `${count} / ${max}`,
      contesDurationHint: "5 minutes maximum",
      contesDurationTooLong:
        "Un conte dure 5 minutes maximum. Enregistrez-en un plus court ou choisissez Autour de vous.",
      discardRecordingTitle: "Abandonner l'enregistrement ?",
      discardRecordingMessage: "Votre voix non publiee sera perdue.",
      keepRecording: "Garder l'enregistrement",
      discard: "Abandonner",
      supportMomentsTitle: "De vrais moments",
      supportMomentsBody: "Grands ou petits",
      supportPerspectiveTitle: "Votre point de vue",
      supportPerspectiveBody: "Enrichit votre communaute",
      supportWorldTitle: "Un monde plus riche",
      supportWorldBody: "Une voix a la fois",
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
