export interface IClipboard {
  write(input: string): Promise<void>;
  read(): Promise<string>;
  writeSync(input: string): void;
  readSync(): string;
}