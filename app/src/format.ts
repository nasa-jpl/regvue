import { Bit, DisplayType, isUnknownBit, RegisterField } from "./types";

// Provides formatting functions to convert various values to strings
export default {
  // Convert an integer to a hex string
  hex(value: number) {
    return "0x" + value.toString(16);
  },

  // Converts a field value to a string
  getFieldValue(field: RegisterField, value: number) {
    if (field.nbits == 1) {
      return value;
    } else {
      return this.hex(value);
    }
  },

  getStringRepresentation(
    value: number | bigint,
    displayType: DisplayType,
    padding: number
  ) {
    if (padding == 1) {
      return value.toString();
    }

    if (displayType == "hexadecimal") {
      const ret = value.toString(16).toUpperCase();
      return "0x" + "0".repeat(padding / 4 - ret.length) + ret;
    } else if (displayType == "binary") {
      const ret = value.toString(2);
      return "0b" + "0".repeat(padding - ret.length) + ret;
    } else if (displayType == "decimal") {
      return value.toString();
    } else {
      throw new Error(`Invalid display type specified: ${displayType}`);
    }
  },

  // Assumes a bitArray with length % 4 == 0
  bitArrayToString(arr: Bit[], displayType: DisplayType) {
    // Use slice to prevent calls to .reverse() from affecting the original array
    const bitArray = arr.slice();

    if (bitArray.length == 1) {
      return bitArray[0].toString();
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
  },
};
