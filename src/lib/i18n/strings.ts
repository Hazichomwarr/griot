import { getLocales } from "expo-localization";

type Language = "en" | "fr";

export const strings = {
  en: {
    audioCard: {
      now: "now",
      distanceAway: (distance: string) => `${distance} away`,
      listens: (count: number) =>
        count === 1 ? "1 listen" : `${count} listens`,
      reactWith: (emoji: string) => `React with ${emoji}`,
      playVoice: "Play voice",
      pauseVoice: "Pause voice",
      saveVoice: "Save voice",
      unsaveVoice: "Remove from saved",
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
    },
    actions: {
      cancel: "Cancel",
      delete: "Delete",
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
      deleteVoiceError: "Could not delete this voice. Try again.",
    },
    record: {
      title: "Share your voice",
      tagline: "Real voices. A richer world.",
      prompt: "What's on your mind?",
      holdToSpeak: "Hold to speak",
      listening: "Listening...",
      releaseToFinish: "Release to finish",
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
      now: "maintenant",
      distanceAway: (distance: string) => `à ${distance.replace(".", ",")}`,
      listens: (count: number) =>
        count < 2 ? `${count} écoute` : `${count} écoutes`,
      reactWith: (emoji: string) => `Réagir avec ${emoji}`,
      playVoice: "Écouter la voix",
      pauseVoice: "Mettre la voix en pause",
      saveVoice: "Sauvegarder la voix",
      unsaveVoice: "Retirer des sauvegardes",
      townFallback: "autour de vous",
    },
    categories: {
      all: "Tout",
      aroundYou: "Autour de vous",
      contes: "Contes",
      contesDescription: "Histoires, légendes et voix à transmettre.",
      aroundYouDescription:
        "Ce qui se passe tout près. Infos, alertes, conseils et plus.",
    },
    floatingMic: {
      feed: "Fil",
      myVoices: "Mes voix",
      record: "Enregistrer",
      saved: "Sauvegardées",
    },
    actions: {
      cancel: "Annuler",
      delete: "Supprimer",
    },
    feed: {
      emptyTitle: "Aucune voix ici pour l'instant",
      emptyBody: "Essayez une autre catégorie ou revenez bientôt.",
      swipeNext: "Glissez pour la voix suivante",
    },
    myVoices: {
      emptyTitle: "Aucune voix publiée",
      emptyBody: "Les voix que vous publiez apparaîtront ici.",
      deleteVoice: "Supprimer la voix",
      deleteVoiceTitle: "Supprimer cette voix\u00a0?",
      deleteVoiceMessage: "Cette voix sera supprimée définitivement.",
      deleteVoiceError: "Impossible de supprimer cette voix. Réessayez.",
    },
    record: {
      title: "Partagez votre voix",
      tagline: "De vraies voix. Un monde plus riche.",
      prompt: "Qu'avez-vous en tête\u00a0?",
      holdToSpeak: "Maintenez pour parler",
      listening: "Enregistrement...",
      releaseToFinish: "Relâchez pour terminer",
      published: "Votre voix est publiée",
      publish: "Publier",
      publishing: "Publication...",
      publishError: "Impossible de publier. Réessayez.",
      playPreview: "Écouter l'aperçu",
      pausePreview: "Mettre l'aperçu en pause",
      recordAgain: "Recommencer",
      replace: "Remplacer",
      voiceTitleLabel: "Ajouter un titre (facultatif)",
      voiceTitlePlaceholder: "Quelques mots sur votre voix",
      voiceTitleTooShort: "Utilisez au moins 3 caractères.",
      voiceTitleCharacterCount: (count: number, max: number) =>
        `${count} / ${max}`,
      contesDurationHint: "5 minutes maximum",
      contesDurationTooLong:
        "Un conte dure 5 minutes maximum. Enregistrez-en un plus court ou choisissez Autour de vous.",
      discardRecordingTitle: "Abandonner l'enregistrement\u00a0?",
      discardRecordingMessage: "Votre voix non publiée sera perdue.",
      keepRecording: "Garder l'enregistrement",
      discard: "Abandonner",
      supportMomentsTitle: "De vrais moments",
      supportMomentsBody: "Grands ou petits",
      supportPerspectiveTitle: "Votre point de vue",
      supportPerspectiveBody: "Enrichit votre communauté",
      supportWorldTitle: "Un monde plus riche",
      supportWorldBody: "Une voix à la fois",
    },
    report: {
      reportVoice: "Signaler la voix",
      reportVoiceTitle: "Signaler cette voix",
      reportReason: "Motif",
      reportDetails: "Détails",
      reportDetailsPlaceholder: "Ajoutez une courte note",
      reportDetailsRequired: "Ajoutez une courte explication.",
      submitReport: "Envoyer le signalement",
      reportSubmitted: "Merci. Signalement envoyé.",
      reportError: "Impossible d'envoyer le signalement. Réessayez.",
      alreadyReported: "Signalée",
      reportReasonHarassment: "Harcèlement ou intimidation",
      reportReasonHate: "Discours haineux",
      reportReasonViolence: "Violence ou menaces",
      reportReasonSexual: "Contenu sexuel",
      reportReasonSpam: "Spam",
      reportReasonMisinformation: "Information fausse ou trompeuse",
      reportReasonOther: "Autre",
    },
    saved: {
      loading: "Chargement des voix sauvegardées...",
      emptyTitle: "Aucune voix sauvegardée",
      emptyBody: "Les voix que vous voulez retrouver apparaîtront ici.",
    },
    toast: {
      voiceIsNowPartOf: "Votre voix fait maintenant partie de",
      place: "Hoboken",
      close: "Fermer",
    },
  },
} as const;

// Language follows the device/app language only (fr, fr-FR, fr-BF, fr-CA...
// resolve to French; everything else to English). Never location.
function getDeviceLanguage(): Language {
  const languageCode = getLocales()[0]?.languageCode?.toLowerCase();

  return languageCode === "fr" ? "fr" : "en";
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
