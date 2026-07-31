declare module "fs" {
  const fs: { readFileSync(path: string, encoding: string): string };
  export default fs;
}

declare module "path" {
  const path: { resolve(...parts: string[]): string };
  export default path;
}

declare const __dirname: string;
