/*
 * Provides formatting functions to convert various values to strings
 */

import bigInt from "big-integer";
import { Bit, DisplayType, isUnknownBit } from "src/types";
import { parseBigInt } from "src/parse";

// Convert an integer to a hex string
export const hex = (value: number | bigInt.BigInteger | string): string => {
  return "0x" + parseBigInt(value.toString()).toString(16);
};

export const getStringRepresentation = (
  value: number | bigInt.BigInteger,
  displayType: DisplayType,
  padding: number
): string => {
  if (padding == 1) {
    return value.toString();
  }

  if (displayType == "hexadecimal") {
    const ret = value.toString(16).toUpperCase();
    const repeatCnt = Math.max(padding / 4 - ret.length, 0);
    return "0x" + "0".repeat(repeatCnt) + ret;
  } else if (displayType == "binary") {
    const ret = value.toString(2);
    const repeatCnt = Math.max(padding - ret.length, 0);
    return "0b" + "0".repeat(repeatCnt) + ret;
  } else if (displayType == "decimal") {
    return value.toString();
  } else {
    throw new Error(`Invalid display type specified: ${displayType}`);
  }
};

/*
 * Turns a Bit[] into a string representation of displayType
 * Assumes a bitArray with length % 4 == 0
 * Note - treats the 0th index as the LSB, so [1, 0, 1, 0] => "0b0101"
 */
export const bitArrayToString = (
  arr: Bit[],
  displayType: DisplayType
): string => {
  // Use slice to prevent calls to .reverse() from affecting the original array
  const bitArray = arr.slice();

  if (bitArray.length == 1) {
    return bitArray.toString();
  }

  // Hexadecimal case
  if (displayType == "hexadecimal") {
    let res = "";

    // Loop by groups of 4 because 1 hex digit is 4 bits
    for (let i = 0; i < bitArray.length; i += 4) {
      const bitString = bitArray
        .slice(i, i + 4)
        .reverse()
        .join("");

      let unknownBit;
      for (const char of bitString) {
        if (isUnknownBit(char)) {
          unknownBit = char;
          break;
        }
      }

      // If any Bit is unknown, then output is unknown
      if (unknownBit) {
        res = unknownBit + res;
      } else {
        // Otherwise convert the bitString to hexadecimal
        const ret = parseInt(bitString, 2).toString(16).toUpperCase();
        res = ret + res;
      }
    }
    return "0x" + res;
  }

  // Binary case
  else if (displayType == "binary") {
    return "0b" + bitArray.reverse().join("");
  }

  // Decimal case
  else if (displayType == "decimal") {
    // If any Bit is unknown then the entire value is unknown
    for (const bit of bitArray) {
      if (isUnknownBit(bit)) {
        return bit;
      }
    }
    return parseInt(bitArray.reverse().join(""), 2).toString();
  }

  // Unsupported type case
  else {
    throw new Error(`Invalid display type specified: ${displayType}`);
  }
};

export const byteSwap = (bitArray: Bit[]): Bit[] => swapBits(bitArray, 8);
export const wordSwap = (bitArray: Bit[]): Bit[] => swapBits(bitArray, 16);

const swapBits = (bitArray: Bit[], nbits: number): Bit[] => {
  if (bitArray.length % nbits != 0) {
    throw Error("Tried to word swap a value with invalid number of bits");
  }

  // Add 8 bits at a time to the front of the new Bit[] result
  const res: Bit[] = [];
  for (let i = 0; i < bitArray.length; i += nbits) {
    res.unshift(...bitArray.slice(i, i + nbits));
  }
  return res;
};
