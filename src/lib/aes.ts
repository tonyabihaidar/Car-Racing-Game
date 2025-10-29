// AES Implementation
// S-Box for SubBytes transformation
const SBOX = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

// Rcon (Round Constant) for key expansion
const RCON = [
  0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36,
];

export type AESKeySize = 128 | 192 | 256;

export interface RoundState {
  round: number;
  afterSubBytes: number[][];
  afterShiftRows: number[][];
  afterMixColumns: number[][] | null;
  afterAddRoundKey: number[][];
  roundKey: number[][];
}

export interface AESResult {
  initialState: number[][];
  rounds: RoundState[];
  keySchedule: number[][][];
  finalState: number[][];
}

// Helper function to convert hex string to byte array
export function hexToBytes(hex: string): number[] {
  const cleanHex = hex.replace(/\s/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  return bytes;
}

// Helper function to convert byte array to 4x4 state matrix
function bytesToState(bytes: number[]): number[][] {
  const state: number[][] = [[], [], [], []];
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      state[row][col] = bytes[row + col * 4];
    }
  }
  return state;
}

// Helper function to clone a state
function cloneState(state: number[][]): number[][] {
  return state.map(row => [...row]);
}

// SubBytes transformation
function subBytes(state: number[][]): number[][] {
  const result = cloneState(state);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i][j] = SBOX[result[i][j]];
    }
  }
  return result;
}

// ShiftRows transformation
function shiftRows(state: number[][]): number[][] {
  const result = cloneState(state);
  // Row 1: shift left by 1
  const temp1 = result[1][0];
  result[1][0] = result[1][1];
  result[1][1] = result[1][2];
  result[1][2] = result[1][3];
  result[1][3] = temp1;
  
  // Row 2: shift left by 2
  const temp2_0 = result[2][0];
  const temp2_1 = result[2][1];
  result[2][0] = result[2][2];
  result[2][1] = result[2][3];
  result[2][2] = temp2_0;
  result[2][3] = temp2_1;
  
  // Row 3: shift left by 3 (or right by 1)
  const temp3 = result[3][3];
  result[3][3] = result[3][2];
  result[3][2] = result[3][1];
  result[3][1] = result[3][0];
  result[3][0] = temp3;
  
  return result;
}

// Galois Field multiplication
function gmul(a: number, b: number): number {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi_bit_set = a & 0x80;
    a <<= 1;
    if (hi_bit_set) a ^= 0x1b; // x^8 + x^4 + x^3 + x + 1
    b >>= 1;
  }
  return p & 0xff;
}

// MixColumns transformation
function mixColumns(state: number[][]): number[][] {
  const result: number[][] = [[], [], [], []];
  for (let col = 0; col < 4; col++) {
    const s0 = state[0][col];
    const s1 = state[1][col];
    const s2 = state[2][col];
    const s3 = state[3][col];
    
    result[0][col] = gmul(s0, 2) ^ gmul(s1, 3) ^ s2 ^ s3;
    result[1][col] = s0 ^ gmul(s1, 2) ^ gmul(s2, 3) ^ s3;
    result[2][col] = s0 ^ s1 ^ gmul(s2, 2) ^ gmul(s3, 3);
    result[3][col] = gmul(s0, 3) ^ s1 ^ s2 ^ gmul(s3, 2);
  }
  return result;
}

// AddRoundKey transformation
function addRoundKey(state: number[][], roundKey: number[][]): number[][] {
  const result = cloneState(state);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i][j] ^= roundKey[i][j];
    }
  }
  return result;
}

// Key expansion
function keyExpansion(key: number[], keySize: AESKeySize): number[][][] {
  const nk = keySize / 32; // Number of 32-bit words in key
  const nr = nk + 6; // Number of rounds
  const keySchedule: number[][][] = [];
  
  // Convert key bytes to words (4-byte columns)
  const w: number[][] = [];
  for (let i = 0; i < nk; i++) {
    w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
  }
  
  // Generate remaining words
  for (let i = nk; i < 4 * (nr + 1); i++) {
    let temp = [...w[i - 1]];
    
    if (i % nk === 0) {
      // RotWord
      const t = temp[0];
      temp[0] = temp[1];
      temp[1] = temp[2];
      temp[2] = temp[3];
      temp[3] = t;
      
      // SubWord
      temp = temp.map(b => SBOX[b]);
      
      // XOR with Rcon
      temp[0] ^= RCON[i / nk];
    } else if (nk > 6 && i % nk === 4) {
      // SubWord (for AES-256 only)
      temp = temp.map(b => SBOX[b]);
    }
    
    w[i] = [];
    for (let j = 0; j < 4; j++) {
      w[i][j] = w[i - nk][j] ^ temp[j];
    }
  }
  
  // Convert words to round keys (4x4 matrices)
  for (let round = 0; round <= nr; round++) {
    const roundKey: number[][] = [[], [], [], []];
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        roundKey[row][col] = w[round * 4 + col][row];
      }
    }
    keySchedule.push(roundKey);
  }
  
  return keySchedule;
}

// Main AES encryption function
export function aesEncrypt(plaintext: string, key: string, keySize: AESKeySize): AESResult {
  const plaintextBytes = hexToBytes(plaintext);
  const keyBytes = hexToBytes(key);
  
  // Validate inputs
  if (plaintextBytes.length !== 16) {
    throw new Error('Plaintext must be exactly 16 bytes (128 bits)');
  }
  if (keyBytes.length !== keySize / 8) {
    throw new Error(`Key must be exactly ${keySize / 8} bytes (${keySize} bits)`);
  }
  
  const nr = (keySize / 32) + 6; // Number of rounds
  const keySchedule = keyExpansion(keyBytes, keySize);
  
  let state = bytesToState(plaintextBytes);
  const initialState = cloneState(state);
  const rounds: RoundState[] = [];
  
  // Initial AddRoundKey
  state = addRoundKey(state, keySchedule[0]);
  
  // Main rounds
  for (let round = 1; round <= nr; round++) {
    const afterSubBytes = subBytes(state);
    const afterShiftRows = shiftRows(afterSubBytes);
    
    let afterMixColumns: number[][] | null = null;
    let beforeAddRoundKey: number[][];
    
    if (round < nr) {
      afterMixColumns = mixColumns(afterShiftRows);
      beforeAddRoundKey = afterMixColumns;
    } else {
      beforeAddRoundKey = afterShiftRows;
    }
    
    const afterAddRoundKey = addRoundKey(beforeAddRoundKey, keySchedule[round]);
    
    rounds.push({
      round,
      afterSubBytes,
      afterShiftRows,
      afterMixColumns,
      afterAddRoundKey,
      roundKey: keySchedule[round],
    });
    
    state = afterAddRoundKey;
  }
  
  return {
    initialState,
    rounds,
    keySchedule,
    finalState: state,
  };
}

// Convert state matrix to hex string
export function stateToHex(state: number[][]): string {
  let hex = '';
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      hex += state[row][col].toString(16).padStart(2, '0');
    }
  }
  return hex.toUpperCase();
}
