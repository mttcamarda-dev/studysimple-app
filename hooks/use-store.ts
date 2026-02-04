"use client";

import { create } from "zustand";

interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Study Session State
  currentDeckId: string | null;
  setCurrentDeckId: (id: string | null) => void;

  // Flashcard Review State
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  toggleFlipped: () => void;
}

export const useStore = create<AppState>((set) => ({
  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Study Session State
  currentDeckId: null,
  setCurrentDeckId: (id) => set({ currentDeckId: id }),

  // Flashcard Review State
  isFlipped: false,
  setIsFlipped: (flipped) => set({ isFlipped: flipped }),
  toggleFlipped: () => set((state) => ({ isFlipped: !state.isFlipped })),
}));
