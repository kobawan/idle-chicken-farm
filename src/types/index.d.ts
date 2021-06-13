export {};
declare global {
  interface Window {
    startDebug: (id: string) => void;
    stopDebug: () => void;
  }
}
