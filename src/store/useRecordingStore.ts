// src/store/useRecordingStore.ts
import { create } from "zustand";

type RecordingType = { id: string; uri: string };

console.log("STORE INIT");

type Store = {
  recordings: RecordingType[];
  activeId: string | null;
  setActive: (id: string) => void;
  addRecording: (uri: string) => void;
};

export const useRecordingStore = create<Store>((set) => ({
  recordings: [],
  activeId: null,
  setActive: (id) => set({ activeId: id }),
  addRecording: (uri) =>
    set((state) => ({
      recordings: [{ id: Date.now().toString(), uri }, ...state.recordings],
    })),
}));
