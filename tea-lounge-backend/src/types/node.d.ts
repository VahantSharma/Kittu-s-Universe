/// <reference types="node" />

// Ensure Node.js globals are available
declare global {
  const process: NodeJS.Process;
  const Buffer: BufferConstructor;
  const __dirname: string;
  const __filename: string;
  const console: Console;
}

export {};
