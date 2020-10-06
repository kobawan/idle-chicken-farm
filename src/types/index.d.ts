export {};
declare global {
  interface Window {
    enableDebugging: (id: string) => void;
  }
}
