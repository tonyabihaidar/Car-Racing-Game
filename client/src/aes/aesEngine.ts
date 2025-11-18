// client/src/aes/aesEngine.ts

import { SBOX, RCON } from "./tables";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type AESState = number[][];

export interface AESRoundStep {
  round: number;
  step: string;
  state: AESState;
  roundKey: AESState;
}

export interface AESEncryptionResult {
  ciphertext: number[];
  steps: AESRoundStep[];
}

/** Block-cipher modes for multi-block encryption. */
export type AesBlockMode = "ECB" | "CBC" | "CFB" | "OFB" | "CTR";

/** Detailed result for a single 16-byte block in multi-block encryption. */
export interface BlockVisualizationResult {
  blockIndex: number;             // 0-based
  mode: AesBlockMode;
  inputBlockHex: string;          // block given to aesEncrypt(...)
  plaintextBlockHex: string;      // padded plaintext block for this index
  ciphertextBlockHex: string;     // ciphertext of this block
  aesResult: AESEncryptionResult; // full round-by-round info
}

/** Overall result for multi-block encryption. */
export interface MultiBlockEncryptionResult {
  mode: AesBlockMode;
  ciphertextHex: string;                // all blocks concatenated
  blockSizeBytes: number;               // always 16
  blockResults: BlockVisualizationResult[];
  paddingDescription: string;
}

/* ------------------------------------------------------------------ */
/*  Utility functions                                                 */
/* ------------------------------------------------------------------ */

export function hexToBytes(hex: string): number[] {
  hex = hex.replace(/\s/g, "").replace(/^0x/i, "");
  if (hex.length % 2 !== 0) throw new Error("Invalid hex length");
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    out.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return out;
}

export function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function bytesToState(bytes: number[]): AESState {
  const s = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      s[c][r] = bytes[c * 4 + r];
    }
  }
  return s;
}

export function stateToBytes(state: AESState): number[] {
  const out = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] = state[c][r] & 0xff;
    }
  }
  return out;
}

function deepCopy<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

function xtime(a: number): number {
  return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff;
}

function mul(a: number, b: number): number {
  let res = 0;
  while (b) {
    if (b & 1) res ^= a;
    a = xtime(a);
    b >>= 1;
  }
  return res & 0xff;
}

/** Convert UTF-8 text → byte array. */
function textToBytes(text: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text));
}

/** Generate random bytes (used only if you later want random IVs). */
function getRandomBytes(len: number): number[] {
  const buf = new Uint8Array(len);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < len; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(buf);
}

/** XOR two 16-byte blocks. */
function xorBlock(a: number[], b: number[]): number[] {
  const out = new Array<number>(16);
  for (let i = 0; i < 16; i++) {
    out[i] = (a[i] ^ b[i]) & 0xff;
  }
  return out;
}

/** PKCS#7 padding (used by some helper functions, not the assignment mode). */
function pkcs7Pad(bytes: number[]): number[] {
  const rem = bytes.length % 16;
  let padLen = 16 - rem;
  if (padLen === 0) padLen = 16;
  const padded = bytes.slice();
  for (let i = 0; i < padLen; i++) padded.push(padLen);
  return padded;
}

/**
 * Assignment padding: pad with zeroes and put the pad length in the last byte.
 * Example for blockSize=16:
 *   if we have 14 bytes, we add [0x00, padLen=2].
 *   if we have exactly 16 bytes, we add a full block of [0x00,...,0x00, 16].
 */
function zeroLenPad(data: number[], blockSize: number): { padded: number[]; padSize: number } {
  const rem = data.length % blockSize;
  const padLen = rem === 0 ? blockSize : blockSize - rem;

  const out = data.slice();
  for (let i = 0; i < padLen - 1; i++) out.push(0x00);
  out.push(padLen);
  return { padded: out, padSize: padLen };
}

/** Increment 16-byte counter (big-endian) for CTR mode. */
function incrementCounter(counter: number[]): void {
  for (let i = 15; i >= 0; i--) {
    counter[i] = (counter[i] + 1) & 0xff;
    if (counter[i] !== 0) break;
  }
}

/** Flatten blocks → single array. */
function flattenBlocks(blocks: number[][]): number[] {
  const out: number[] = [];
  for (const blk of blocks) out.push(...blk);
  return out;
}

/** Normalize hex (remove spaces/newlines, lowercase). */
function normalizeHex(hex: string): string {
  return hex.replace(/\s+/g, "").toLowerCase();
}

/* ------------------------------------------------------------------ */
/*  AES core transformations                                          */
/* ------------------------------------------------------------------ */

export function subBytes(state: AESState) {
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      state[c][r] = SBOX[state[c][r]];
    }
  }
}

export function shiftRows(state: AESState) {
  // row 1
  const r1 = [state[1][1], state[2][1], state[3][1], state[0][1]];
  state[0][1] = r1[0];
  state[1][1] = r1[1];
  state[2][1] = r1[2];
  state[3][1] = r1[3];

  // row 2
  const r2 = [state[2][2], state[3][2], state[0][2], state[1][2]];
  state[0][2] = r2[0];
  state[1][2] = r2[1];
  state[2][2] = r2[2];
  state[3][2] = r2[3];

  // row 3
  const r3 = [state[3][3], state[0][3], state[1][3], state[2][3]];
  state[0][3] = r3[0];
  state[1][3] = r3[1];
  state[2][3] = r3[2];
  state[3][3] = r3[3];
}

export function mixColumns(state: AESState) {
  for (let c = 0; c < 4; c++) {
    const a0 = state[c][0];
    const a1 = state[c][1];
    const a2 = state[c][2];
    const a3 = state[c][3];

    state[c][0] = mul(a0, 2) ^ mul(a1, 3) ^ mul(a2, 1) ^ mul(a3, 1);
    state[c][1] = mul(a0, 1) ^ mul(a1, 2) ^ mul(a2, 3) ^ mul(a3, 1);
    state[c][2] = mul(a0, 1) ^ mul(a1, 1) ^ mul(a2, 2) ^ mul(a3, 3);
    state[c][3] = mul(a0, 3) ^ mul(a1, 1) ^ mul(a2, 1) ^ mul(a3, 2);
  }
}

export function addRoundKey(state: AESState, roundKey: AESState) {
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      state[c][r] ^= roundKey[c][r];
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Key expansion                                                     */
/* ------------------------------------------------------------------ */

function rotWord(word: number[]): number[] {
  return [word[1], word[2], word[3], word[0]];
}

function subWord(word: number[]): number[] {
  return word.map((b) => SBOX[b]);
}

export function keyExpansion(keyBytes: number[]) {
  const keySize = keyBytes.length; // 16, 24, 32 bytes
  const Nk = keySize / 4;
  const Nr = Nk + 6;

  const words: number[][] = [];
  let temp = new Array(4);

  for (let i = 0; i < Nk; i++) {
    words[i] = [
      keyBytes[4 * i],
      keyBytes[4 * i + 1],
      keyBytes[4 * i + 2],
      keyBytes[4 * i + 3],
    ];
  }

  for (let i = Nk; i < 4 * (Nr + 1); i++) {
    temp = [...words[i - 1]];

    if (i % Nk === 0) {
      temp = rotWord(temp);
      temp = subWord(temp);
      temp[0] ^= RCON[i / Nk];
    } else if (Nk > 6 && i % Nk === 4) {
      temp = subWord(temp);
    }

    words[i] = [
      words[i - Nk][0] ^ temp[0],
      words[i - Nk][1] ^ temp[1],
      words[i - Nk][2] ^ temp[2],
      words[i - Nk][3] ^ temp[3],
    ];
  }

  return { words, Nk, Nr };
}
export function bytesToBinary(bytes: number[]): string {
  return bytes.map(b => b.toString(2).padStart(8, '0')).join(' ');
}

export function bytesToDecimal(bytes: number[]): string {
  return bytes.map(b => b.toString(10)).join(' ');
}

/* ------------------------------------------------------------------ */
/*  AES encryption with round tracking                                */
/* ------------------------------------------------------------------ */

export function aesEncrypt(msg: number[], key: number[]): AESEncryptionResult {
  const { words, Nr } = keyExpansion(key);

  const steps: AESRoundStep[] = [];
  const roundKeys: AESState[] = [];

  // Build round keys as 4x4 matrices
  for (let rk = 0; rk <= Nr; rk++) {
    const base = rk * 4;
    roundKeys.push([
      [...words[base]],
      [...words[base + 1]],
      [...words[base + 2]],
      [...words[base + 3]],
    ]);
  }

  let state = bytesToState(msg);

  // Initial input state
  steps.push({
    round: 0,
    step: "Input",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[0]),
  });

  // Initial AddRoundKey
  addRoundKey(state, roundKeys[0]);
  steps.push({
    round: 0,
    step: "AddRoundKey",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[0]),
  });

  // Rounds 1 .. Nr-1
  for (let r = 1; r < Nr; r++) {
    subBytes(state);
    steps.push({
      round: r,
      step: "SubBytes",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });

    shiftRows(state);
    steps.push({
      round: r,
      step: "ShiftRows",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });

    mixColumns(state);
    steps.push({
      round: r,
      step: "MixColumns",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });

    addRoundKey(state, roundKeys[r]);
    steps.push({
      round: r,
      step: "AddRoundKey",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });
  }

  // Final round (no MixColumns)
  subBytes(state);
  steps.push({
    round: Nr,
    step: "SubBytes",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[Nr]),
  });

  shiftRows(state);
  steps.push({
    round: Nr,
    step: "ShiftRows",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[Nr]),
  });

  addRoundKey(state, roundKeys[Nr]);
  steps.push({
    round: Nr,
    step: "AddRoundKey",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[Nr]),
  });

  return {
    ciphertext: stateToBytes(state),
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  Multi-block HEX encryption in 5 modes (assignment padding)        */
/* ------------------------------------------------------------------ */

/**
 * Encrypt a HEX plaintext of any length using one of 5 modes:
 * ECB, CBC, CFB, OFB, CTR.
 *
 * Padding: zero bytes + final byte = pad length (1..16).
 * IV / counter: 16 zero bytes (as required in the assignment).
 * For CTR, an optional counterHex may override the zero counter.
 */
export function encryptHexMultiBlock(
  plaintextHex: string,
  keyHex: string,
  mode: AesBlockMode,
  counterHex?: string
): MultiBlockEncryptionResult {
  const normalizedPlain = normalizeHex(plaintextHex);
  if (!normalizedPlain.length) {
    throw new Error("Plaintext hex is empty.");
  }
  if (normalizedPlain.length % 2 !== 0) {
    throw new Error(
      "Plaintext hex must have an even number of characters (full bytes)."
    );
  }

  const plainBytes = hexToBytes(normalizedPlain);
  const keyBytes = hexToBytes(normalizeHex(keyHex));

  if (
    keyBytes.length !== 16 &&
    keyBytes.length !== 24 &&
    keyBytes.length !== 32
  ) {
    throw new Error("Key must be 16, 24, or 32 bytes for AES-128/192/256.");
  }

  const blockSize = 16;
  const { padded, padSize } = zeroLenPad(plainBytes, blockSize);
  const totalBlocks = padded.length / blockSize;

  // IV / registers start as all zeros
  const iv = new Array<number>(blockSize).fill(0x00);
  let prevCipher = iv.slice();      // CBC / CFB
  let ofbRegister = iv.slice();     // OFB
  let counter = iv.slice();         // CTR

  if (mode === "CTR" && counterHex) {
    const counterBytes = hexToBytes(normalizeHex(counterHex));
    if (counterBytes.length >= blockSize) {
      counter = counterBytes.slice(counterBytes.length - blockSize);
    } else {
      const padZeros = new Array<number>(blockSize - counterBytes.length).fill(
        0x00
      );
      counter = padZeros.concat(counterBytes);
    }
  }

  const allCipherBytes: number[] = [];
  const blockResults: BlockVisualizationResult[] = [];

  for (let blockIndex = 0; blockIndex < totalBlocks; blockIndex++) {
    const offset = blockIndex * blockSize;
    const plainBlock = padded.slice(offset, offset + blockSize);

    let aesInputBlock: number[];
    let ciphertextBlock: number[];

    if (mode === "ECB") {
      aesInputBlock = plainBlock;
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      ciphertextBlock = aesRes.ciphertext;

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        plaintextBlockHex: bytesToHex(plainBlock),
        ciphertextBlockHex: bytesToHex(ciphertextBlock),
        aesResult: aesRes,
      });
      allCipherBytes.push(...ciphertextBlock);
    } else if (mode === "CBC") {
      // AES(plain XOR prevCipher)
      const xored = xorBlock(plainBlock, prevCipher);
      aesInputBlock = xored;
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      ciphertextBlock = aesRes.ciphertext;
      prevCipher = ciphertextBlock.slice();

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        plaintextBlockHex: bytesToHex(plainBlock),
        ciphertextBlockHex: bytesToHex(ciphertextBlock),
        aesResult: aesRes,
      });
      allCipherBytes.push(...ciphertextBlock);
    } else if (mode === "CFB") {
      // cipherBlock = plain XOR AES(prevCipher)
      aesInputBlock = prevCipher.slice();
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      const keystream = aesRes.ciphertext;

      ciphertextBlock = xorBlock(plainBlock, keystream);
      prevCipher = ciphertextBlock.slice();

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        plaintextBlockHex: bytesToHex(plainBlock),
        ciphertextBlockHex: bytesToHex(ciphertextBlock),
        aesResult: aesRes,
      });
      allCipherBytes.push(...ciphertextBlock);
    } else if (mode === "OFB") {
      // cipherBlock = plain XOR AES(ofbRegister)
      aesInputBlock = ofbRegister.slice();
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      const keystream = aesRes.ciphertext;
      ofbRegister = keystream.slice();

      ciphertextBlock = xorBlock(plainBlock, keystream);

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        plaintextBlockHex: bytesToHex(plainBlock),
        ciphertextBlockHex: bytesToHex(ciphertextBlock),
        aesResult: aesRes,
      });
      allCipherBytes.push(...ciphertextBlock);
    } else {
      // CTR
      aesInputBlock = counter.slice();
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      const keystream = aesRes.ciphertext;

      ciphertextBlock = xorBlock(plainBlock, keystream);
      incrementCounter(counter);

      blockResults.push({
        blockIndex,
        mode: "CTR",
        inputBlockHex: bytesToHex(aesInputBlock),
        plaintextBlockHex: bytesToHex(plainBlock),
        ciphertextBlockHex: bytesToHex(ciphertextBlock),
        aesResult: aesRes,
      });
      allCipherBytes.push(...ciphertextBlock);
    }
  }

  const paddingDescription = `Applied zero+length padding: last block padded with ${padSize} byte(s). Block size = ${blockSize} bytes.`;

  return {
    mode,
    ciphertextHex: bytesToHex(allCipherBytes),
    blockSizeBytes: blockSize,
    blockResults,
    paddingDescription,
  };
}

/* ------------------------------------------------------------------ */
/*  TEXT multi-block encryption: used by the second module (UI)       */
/* ------------------------------------------------------------------ */

/**
 * Encrypt arbitrary TEXT (UTF-8) using the same 5 modes and the same
 * zero+length padding as encryptHexMultiBlock. This is what the second
 * module in the UI will call.
 */
export function encryptTextMultiBlock(
  plaintext: string,
  keyHex: string,
  mode: AesBlockMode,
  counterHex?: string
): MultiBlockEncryptionResult {
  if (!plaintext.length) {
    throw new Error("Plaintext is empty.");
  }

  const bytes = textToBytes(plaintext);
  const hex = bytesToHex(bytes);

  return encryptHexMultiBlock(hex, keyHex, mode, counterHex);
}

/* ------------------------------------------------------------------ */
/*  Optional helpers (not required by the new UI but kept for reuse)  */
/* ------------------------------------------------------------------ */

export interface FullTextEncryptionResult {
  mode: "CBC" | "CTR";
  ciphertextHex: string;
  ivHex: string;
}

/** AES-CBC on TEXT with PKCS#7 padding (separate from assignment mode). */
export function encryptTextCBC(
  plaintext: string,
  keyHex: string
): FullTextEncryptionResult {
  if (!plaintext.length) throw new Error("Plaintext is empty.");
  const keyBytes = hexToBytes(normalizeHex(keyHex));
  if (
    keyBytes.length !== 16 &&
    keyBytes.length !== 24 &&
    keyBytes.length !== 32
  ) {
    throw new Error("Key must be 16, 24, or 32 bytes for AES-128/192/256.");
  }

  const plainBytes = textToBytes(plaintext);
  const padded = pkcs7Pad(plainBytes);
  const iv = getRandomBytes(16);

  let prevBlock = iv.slice();
  const cipherBlocks: number[][] = [];

  for (let offset = 0; offset < padded.length; offset += 16) {
    const block = padded.slice(offset, offset + 16);
    const xored = xorBlock(block, prevBlock);
    const enc = aesEncrypt(xored, keyBytes);
    const cipherBlock = enc.ciphertext;
    cipherBlocks.push(cipherBlock);
    prevBlock = cipherBlock;
  }

  const ciphertextBytes = flattenBlocks(cipherBlocks);

  return {
    mode: "CBC",
    ciphertextHex: bytesToHex(ciphertextBytes),
    ivHex: bytesToHex(iv),
  };
}
// ============== DECRYPTION FUNCTIONS ==============

// Helper function to clone state (needed for decryption)
function cloneState(state: AESState): AESState {
  return deepCopy(state);
}

// Helper function to get round key as matrix (needed for decryption)
function getRoundKeyMatrix(expandedKey: any, round: number): AESState {
  const base = round * 4;
  return [
    [...expandedKey.words[base]],
    [...expandedKey.words[base + 1]],
    [...expandedKey.words[base + 2]],
    [...expandedKey.words[base + 3]],
  ];
}

// Helper to convert expanded key format for addRoundKey
function getStateFromWords(words: number[][], roundIndex: number): AESState {
  const base = roundIndex * 4;
  return [
    [...words[base]],
    [...words[base + 1]],
    [...words[base + 2]],
    [...words[base + 3]],
  ];
}

// Galois field multiplication (needed for invMixColumns)
function gfMul(a: number, b: number): number {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) {
      p ^= a;
    }
    const hiBitSet = a & 0x80;
    a <<= 1;
    if (hiBitSet) {
      a ^= 0x1b;
    }
    b >>= 1;
  }
  return p & 0xff;
}

// Inverse SubBytes
function invSubBytes(state: AESState): AESState {
  const invSBox = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d,
  ];
  
  const newState: AESState = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      newState[c][r] = invSBox[state[c][r]];
    }
  }
  return newState;
}

// Inverse ShiftRows
function invShiftRows(state: AESState): AESState {
  const newState: AESState = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  
  // Copy row 0 (no shift)
  for (let c = 0; c < 4; c++) {
    newState[c][0] = state[c][0];
  }
  
  // Row 1: shift right by 1 (inverse of left shift by 1)
  for (let c = 0; c < 4; c++) {
    newState[c][1] = state[(c + 3) % 4][1];
  }
  
  // Row 2: shift right by 2 (inverse of left shift by 2)
  for (let c = 0; c < 4; c++) {
    newState[c][2] = state[(c + 2) % 4][2];
  }
  
  // Row 3: shift right by 3 (inverse of left shift by 3)
  for (let c = 0; c < 4; c++) {
    newState[c][3] = state[(c + 1) % 4][3];
  }
  
  return newState;
}

// Inverse MixColumns
function invMixColumns(state: AESState): AESState {
  const newState: AESState = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let c = 0; c < 4; c++) {
    const s0 = state[c][0];
    const s1 = state[c][1];
    const s2 = state[c][2];
    const s3 = state[c][3];

    newState[c][0] = gfMul(0x0e, s0) ^ gfMul(0x0b, s1) ^ gfMul(0x0d, s2) ^ gfMul(0x09, s3);
    newState[c][1] = gfMul(0x09, s0) ^ gfMul(0x0e, s1) ^ gfMul(0x0b, s2) ^ gfMul(0x0d, s3);
    newState[c][2] = gfMul(0x0d, s0) ^ gfMul(0x09, s1) ^ gfMul(0x0e, s2) ^ gfMul(0x0b, s3);
    newState[c][3] = gfMul(0x0b, s0) ^ gfMul(0x0d, s1) ^ gfMul(0x09, s2) ^ gfMul(0x0e, s3);
  }

  return newState;
}

// Main AES Decryption Function
export function aesDecrypt(
  ciphertext: number[],
  key: number[]
): AESEncryptionResult {
  const expanded = keyExpansion(key);
  const { words, Nr } = expanded;
  
  const steps: AESRoundStep[] = [];
  let state = bytesToState(ciphertext);

  // Build round keys as matrices for visualization
  const roundKeys: AESState[] = [];
  for (let rk = 0; rk <= Nr; rk++) {
    roundKeys.push(getStateFromWords(words, rk));
  }

  // Initial AddRoundKey (with last round key)
  steps.push({
    round: 0,
    step: "Initial AddRoundKey",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[Nr]),
  });
  addRoundKey(state, roundKeys[Nr]);

  // Main rounds (Nr-1 down to 1)
  for (let r = Nr - 1; r >= 1; r--) {
    // InvShiftRows
    state = invShiftRows(state);
    steps.push({
      round: Nr - r,
      step: "InvShiftRows",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });

    // InvSubBytes
    state = invSubBytes(state);
    steps.push({
      round: Nr - r,
      step: "InvSubBytes",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });

    // AddRoundKey
    addRoundKey(state, roundKeys[r]);
    steps.push({
      round: Nr - r,
      step: "AddRoundKey",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });

    // InvMixColumns
    state = invMixColumns(state);
    steps.push({
      round: Nr - r,
      step: "InvMixColumns",
      state: deepCopy(state),
      roundKey: deepCopy(roundKeys[r]),
    });
  }

  // Final round (no InvMixColumns)
  state = invShiftRows(state);
  steps.push({
    round: Nr,
    step: "InvShiftRows",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[0]),
  });

  state = invSubBytes(state);
  steps.push({
    round: Nr,
    step: "InvSubBytes",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[0]),
  });

  addRoundKey(state, roundKeys[0]);
  steps.push({
    round: Nr,
    step: "Final AddRoundKey",
    state: deepCopy(state),
    roundKey: deepCopy(roundKeys[0]),
  });

  const plaintext = stateToBytes(state);

  return {
    ciphertext: plaintext, // Note: Using 'ciphertext' field but it's actually plaintext
    steps,
  };
}
// Add these type definitions near the top with other types
export interface BlockDecryptionResult {
  blockIndex: number;
  mode: AesBlockMode;
  inputBlockHex: string;
  ciphertextBlockHex: string;
  plaintextBlockHex: string;
  aesResult: AESEncryptionResult;
}

export interface MultiBlockDecryptionResult {
  mode: AesBlockMode;
  plaintextHex: string;
  blockSizeBytes: number;
  blockResults: BlockDecryptionResult[];
  paddingDescription: string;
}

// Add this function after encryptTextMultiBlock function
export function decryptTextMultiBlock(
  ciphertextHex: string,
  keyHex: string,
  mode: AesBlockMode,
  counterHex?: string
): MultiBlockDecryptionResult {
  const normalizedCipher = normalizeHex(ciphertextHex);
  if (!normalizedCipher.length) {
    throw new Error("Ciphertext hex is empty.");
  }
  if (normalizedCipher.length % 2 !== 0) {
    throw new Error("Ciphertext hex must have an even number of characters.");
  }
  if (normalizedCipher.length % 32 !== 0) {
    throw new Error("Ciphertext must be a multiple of 16 bytes (32 hex chars).");
  }

  const cipherBytes = hexToBytes(normalizedCipher);
  const keyBytes = hexToBytes(normalizeHex(keyHex));

  if (
    keyBytes.length !== 16 &&
    keyBytes.length !== 24 &&
    keyBytes.length !== 32
  ) {
    throw new Error("Key must be 16, 24, or 32 bytes for AES-128/192/256.");
  }

  const blockSize = 16;
  const totalBlocks = cipherBytes.length / blockSize;

  // IV / registers start as all zeros
  const iv = new Array<number>(blockSize).fill(0x00);
  let prevCipher = iv.slice();
  let ofbRegister = iv.slice();
  let counter = iv.slice();

  if (mode === "CTR" && counterHex) {
    const counterBytes = hexToBytes(normalizeHex(counterHex));
    if (counterBytes.length >= blockSize) {
      counter = counterBytes.slice(counterBytes.length - blockSize);
    } else {
      const padZeros = new Array<number>(blockSize - counterBytes.length).fill(0x00);
      counter = padZeros.concat(counterBytes);
    }
  }

  const allPlaintextBytes: number[] = [];
  const blockResults: BlockDecryptionResult[] = [];

  for (let blockIndex = 0; blockIndex < totalBlocks; blockIndex++) {
    const offset = blockIndex * blockSize;
    const cipherBlock = cipherBytes.slice(offset, offset + blockSize);

    let aesInputBlock: number[];
    let plaintextBlock: number[];

    if (mode === "ECB") {
      aesInputBlock = cipherBlock;
      const aesRes = aesDecrypt(aesInputBlock, keyBytes);
      plaintextBlock = aesRes.ciphertext; // Note: using ciphertext field but it's plaintext

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        ciphertextBlockHex: bytesToHex(cipherBlock),
        plaintextBlockHex: bytesToHex(plaintextBlock),
        aesResult: aesRes,
      });
      allPlaintextBytes.push(...plaintextBlock);
    } else if (mode === "CBC") {
      aesInputBlock = cipherBlock;
      const aesRes = aesDecrypt(aesInputBlock, keyBytes);
      const decrypted = aesRes.ciphertext;
      plaintextBlock = xorBlock(decrypted, prevCipher);
      prevCipher = cipherBlock.slice();

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        ciphertextBlockHex: bytesToHex(cipherBlock),
        plaintextBlockHex: bytesToHex(plaintextBlock),
        aesResult: aesRes,
      });
      allPlaintextBytes.push(...plaintextBlock);
    } else if (mode === "CFB") {
      aesInputBlock = prevCipher.slice();
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      const keystream = aesRes.ciphertext;
      plaintextBlock = xorBlock(cipherBlock, keystream);
      prevCipher = cipherBlock.slice();

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        ciphertextBlockHex: bytesToHex(cipherBlock),
        plaintextBlockHex: bytesToHex(plaintextBlock),
        aesResult: aesRes,
      });
      allPlaintextBytes.push(...plaintextBlock);
    } else if (mode === "OFB") {
      aesInputBlock = ofbRegister.slice();
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      const keystream = aesRes.ciphertext;
      ofbRegister = keystream.slice();
      plaintextBlock = xorBlock(cipherBlock, keystream);

      blockResults.push({
        blockIndex,
        mode,
        inputBlockHex: bytesToHex(aesInputBlock),
        ciphertextBlockHex: bytesToHex(cipherBlock),
        plaintextBlockHex: bytesToHex(plaintextBlock),
        aesResult: aesRes,
      });
      allPlaintextBytes.push(...plaintextBlock);
    } else {
      // CTR
      aesInputBlock = counter.slice();
      const aesRes = aesEncrypt(aesInputBlock, keyBytes);
      const keystream = aesRes.ciphertext;
      plaintextBlock = xorBlock(cipherBlock, keystream);
      incrementCounter(counter);

      blockResults.push({
        blockIndex,
        mode: "CTR",
        inputBlockHex: bytesToHex(aesInputBlock),
        ciphertextBlockHex: bytesToHex(cipherBlock),
        plaintextBlockHex: bytesToHex(plaintextBlock),
        aesResult: aesRes,
      });
      allPlaintextBytes.push(...plaintextBlock);
    }
  }

  // Remove padding (zero+length scheme)
  const lastByte = allPlaintextBytes[allPlaintextBytes.length - 1];
  const paddingLength = lastByte;
  
  let unpaddedBytes: number[];
  if (paddingLength > 0 && paddingLength <= 16) {
    unpaddedBytes = allPlaintextBytes.slice(0, -paddingLength);
  } else {
    unpaddedBytes = allPlaintextBytes;
  }

  const paddingDescription = `Removed zero+length padding: ${paddingLength} byte(s) removed from last block.`;

  return {
    mode,
    plaintextHex: bytesToHex(unpaddedBytes),
    blockSizeBytes: blockSize,
    blockResults,
    paddingDescription,
  };
}

/** AES-CTR on TEXT (no PKCS#7 padding). */
export function encryptTextCTR(
  plaintext: string,
  keyHex: string
): FullTextEncryptionResult {
  if (!plaintext.length) throw new Error("Plaintext is empty.");
  const keyBytes = hexToBytes(normalizeHex(keyHex));
  if (
    keyBytes.length !== 16 &&
    keyBytes.length !== 24 &&
    keyBytes.length !== 32
  ) {
    throw new Error("Key must be 16, 24, or 32 bytes for AES-128/192/256.");
  }

  const plainBytes = textToBytes(plaintext);
  const iv = getRandomBytes(16);
  const counter = iv.slice();
  const cipherBytes: number[] = [];

  for (let offset = 0; offset < plainBytes.length; offset += 16) {
    const block = plainBytes.slice(offset, offset + 16);
    const keystream = aesEncrypt(counter, keyBytes).ciphertext;

    const chunk: number[] = [];
    for (let i = 0; i < block.length; i++) {
      chunk.push((block[i] ^ keystream[i]) & 0xff);
    }
    cipherBytes.push(...chunk);
    incrementCounter(counter);
  }
  

  return {
    mode: "CTR",
    ciphertextHex: bytesToHex(cipherBytes),
    ivHex: bytesToHex(iv),
  };
  
  
}
