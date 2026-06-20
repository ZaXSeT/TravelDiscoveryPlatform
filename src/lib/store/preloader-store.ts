// Global state to track if the preloader has run during the current SPA session.
// This allows the preloader to run on hard refreshes, but skip on client-side navigation.

let preloaderRun = false;

export const preloaderStore = {
  get hasRun() {
    return preloaderRun;
  },
  setHasRun(value: boolean) {
    preloaderRun = value;
  },
};
