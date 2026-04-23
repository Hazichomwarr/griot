// src/store/useRecordingStore.ts
import { create } from "zustand";

type RecordingType = { id: string; uri: string };

console.log("STORE INIT");

type Store = {
  recordings: RecordingType[];
  addRecording: (uri: string) => void;
};

export const useRecordingStore = create<Store>((set) => ({
  recordings: [],
  addRecording: (uri) =>
    set((state) => ({
      recordings: [{ id: Date.now().toString(), uri }, ...state.recordings],
    })),
}));
