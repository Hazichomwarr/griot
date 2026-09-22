import { setAudioModeAsync } from "expo-audio";

let audioModeOperation = Promise.resolve();

function configureAudioMode(mode: {
  allowsRecording: boolean;
  playsInSilentMode: boolean;
}) {
  const operation = audioModeOperation.then(() => setAudioModeAsync(mode));
  audioModeOperation = operation.catch(() => {});
  return operation;
}

export function configurePlaybackAudioMode() {
  return configureAudioMode({
    allowsRecording: false,
    playsInSilentMode: true,
  });
}

export function configureRecordingAudioMode() {
  return configureAudioMode({
    allowsRecording: true,
    playsInSilentMode: true,
  });
}
