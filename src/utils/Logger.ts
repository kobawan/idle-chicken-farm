const allowedLogs: string[] = [];
const hasLoggingEnabled = (id: string) => allowedLogs.includes(id);

(window as any).enableDebugging = (id: string) => {
  allowedLogs.push(id)
};

export class Logger {
  private displayName: string;
  private id: string;

  constructor(displayName: string, id: string) {
    this.displayName = displayName;
    this.id = id;
  }

  public log(...args: any[]) {
    if(!hasLoggingEnabled(this.id)) {
      return;
    }
    console.log(`${this.displayName}: `, ...args);
  }

  public error(...args: any[]) {
    console.error(`${this.displayName}: `, ...args);
  }
}
