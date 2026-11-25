export class HeldKeys {
  private readonly keys = new Set<string>();

  press(key: string): void {
    this.keys.add(key);
  }

  release(key: string): void {
    this.keys.delete(key);
  }

  isHeld(key: string): boolean {
    return this.keys.has(key);
  }

  clear(): void {
    this.keys.clear();
  }
}
