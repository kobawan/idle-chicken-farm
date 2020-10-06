const allowedLogs: string[] = [];
const hasLoggingEnabled = (id: string) => allowedLogs.includes(id);

window.enableDebugging = (id: string) => {
  allowedLogs.push(id);
};

export class Logger {
  private displayName: string;
  private id: string;

  constructor(displayName: string, id: string) {
    this.displayName = displayName;
    this.id = id;
  }

  public log(...args: unknown[]) {
    if (!hasLoggingEnabled(this.id)) {
      return;
    }
    console.log(`${this.displayName}: `, ...args);
  }

  public error(...args: unknown[]) {
    console.error(`${this.displayName}: `, ...args);
  }
}
