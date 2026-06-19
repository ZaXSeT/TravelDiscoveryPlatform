import { create } from "zustand";

// Drives the guest->user gate. A guest action stores its continuation (onAuthed);
// after successful auth the gate replays it on the same page (02_USER_AND_AUTH_FLOWS §4).
interface AuthGateState {
  open: boolean;
  title: string;
  description: string;
  onAuthed: (() => void | Promise<void>) | null;
  openGate: (opts: {
    title?: string;
    description?: string;
    onAuthed: () => void | Promise<void>;
  }) => void;
  close: () => void;
}

export const useAuthGate = create<AuthGateState>((set) => ({
  open: false,
  title: "Sign in to continue",
  description: "",
  onAuthed: null,
  openGate: ({ title, description, onAuthed }) =>
    set({
      open: true,
      title: title ?? "Sign in to continue",
      description: description ?? "",
      onAuthed,
    }),
  close: () => set({ open: false, onAuthed: null }),
}));
