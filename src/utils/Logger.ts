const allowedLogs: string[] = [];
const hasLoggingEnabled = (id: string) => allowedLogs.includes(id);

window.enableDebugging = (id: string) => {
  allowedLogs.push(id);
};

interface LoggerProps {
  name: string;
  id: string;
  color: string;
  tags?: string[];
}

export class Logger {
  private name: string;
  private color: string;
  private id: string;
  private tags: string[];

  constructor({ name, id, color, tags = [] }: LoggerProps) {
    this.name = name;
    this.id = id;
    this.color = color;

    const [tagNames, ...tagStyles] = tags;
    this.tags = [
      (tagNames || "") + `%c ${this.name} `,
      ...tagStyles,
      `background-color:${this.color};color:black;`,
    ];
  }

  public log(...args: unknown[]) {
    if (!hasLoggingEnabled(this.id)) {
      return;
    }
    console.log(...this.tags, ...args);
  }

  public error(...args: unknown[]) {
    if (!hasLoggingEnabled(this.id)) {
      return;
    }
    console.error(...this.tags, ...args);
  }

  public subLogger({ name, color }: Pick<LoggerProps, "color" | "name">) {
    return new Logger({ name, color, id: this.id, tags: this.tags });
  }
}
