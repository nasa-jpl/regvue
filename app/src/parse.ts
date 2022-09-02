import { getStringRepresentation } from "src/format";
import { Bit, isUnknownBit } from "src/types";
import bigInt from "big-integer";

/*
 * Provides various string parsing functions
 */

/*
 * Parses numeric values in various formats
 *
 * Supports various bases.  See base().
 * Supports '_' separators.
 */
export const num = (s: string) => {
  const { str, base } = getBase(s.trim());
  return parseInt(str.replaceAll("_", ""), base);
};

/*
 * Parses the base of a numeric value
 * - Base 2 - '0b' prefix
 * - Base 10 - no prefix
 * - Base 16 - '0x' prefix
 */
export const getBase = (s: string) => {
  const lc = s.toLowerCase();

  if (lc.startsWith("0x")) {
    return {
      str: lc.slice(2),
      base: 16,
    };
  } else if (lc.startsWith("0b")) {
    return {
      str: lc.slice(2),
      base: 2,
    };
  } else {
    return {
      str: lc,
      base: 10,
    };
  }
};

export const removeWhitespace = (str: string): string => {
  return str.trim().replaceAll(" ", "").replaceAll("_", "");
};

/*
 * Converts a string representing a register/field value into a Bit[]
 * Uses the prefix ("0b", "0x", or "") to determine the numeric type
 * Uses the length (default 32) to pad zeros to the front of the returned Bit[]
 */
export const stringToBitArray = (value: string, length = 32) => {
  const res: Bit[] = [];
  value = removeWhitespace(value);

  // Hexadecimal case
  if (value.substring(0, 2) == "0x") {
    // Loop through each hex digit after the prefix
    for (const char of value.substring(2)) {
      // Look at each hex decimal

      if (isUnknownBit(char)) {
        // If the character is ? we append ? 4 times (a hex digit is 4 bits)
        for (let i = 0; i < 4; i++) res.push(char);
      } else {
        // Get a number representation of the hex digit
        const value = num("0x" + char);

        // Convert the number to a binary string (i.e. 10 => "0b1010")
        const binaryString = getStringRepresentation(value, "binary", 4);

        // Append each binary digit after the prefix to the result array
        for (const digit of binaryString.substring(2)) {
          res.push(parseInt(digit) as Bit);
        }
      }
    }
  }

  // Binary case
  else if (value.substring(0, 2) == "0b") {
    // Loop through each binary digit after the prefix
    for (const char of value.substring(2)) {
      // Push the digit as a Bit type
      if (isUnknownBit(char)) res.push(char);
      else res.push(parseInt(char) as Bit);
    }
  }

  // Decimal case
  else {
    // Look for any UnknownBits
    let unknownBit;
    for (const bit of value) {
      if (isUnknownBit(bit)) {
        unknownBit = bit as Bit;
        break;
      }
    }

    // If any digit in the decimal is unknown, then the whole value is unknown
    if (unknownBit) {
      for (let i = 0; i < length; i++) res.push(unknownBit);
    } else {
      // Get a number representation
      const n = num(value);

      // Convert the number to a binary string
      const binaryString = n.toString(2);

      // Push each binary digit as a Bit type
      for (const char of binaryString) {
        res.push(parseInt(char) as Bit);
      }
    }
  }

  // Pad the front of the array with 0's to fill up the remaining length
  for (let i = res.length; i < length; i++) {
    res.unshift(0);
  }

  // Return reversed so that the 0 index refers to the lsb
  return res.reverse().slice(0, length);
};

// Converts a string with base encoding to a BigInteger
export const parseBigInt = (
  value: string | number | bigInt.BigInteger
): bigInt.BigInteger => {
  value = value.toString();

  if (value.startsWith("0x")) {
    return bigInt(value.substring(2), 16);
  } else if (value.startsWith("0b")) {
    return bigInt(value.substring(2), 2);
  } else {
    return bigInt(value);
  }
};
