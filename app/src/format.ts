import { Bit, DisplayType, RegisterField } from "./types";

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

  // Assumes a bitArray with length 32
  bitArrayToString(arr: Bit[], displayType: DisplayType) {
    const bitArray = arr.slice();

    if (bitArray.length == 1) {
      return bitArray[0].toString();
    }

    if (displayType == "hexadecimal") {
      // hex case
      // loop by groups of 4
      // if any input is "?" then output is "?"
      // otherwise combine to bit string and convert to hex
      let res = "";
      for (let i = 0; i < bitArray.length; i += 4) {
        const bitString = bitArray
          .slice(i, i + 4)
          .reverse()
          .join("");
        if (bitString.includes("?")) {
          res = "?" + res;
        } else {
          const ret = parseInt(bitString, 2).toString(16).toUpperCase();
          res = ret + res;
        }
      }
      return "0x" + res;
    } else if (displayType == "binary") {
      // bin case
      return "0b" + bitArray.reverse().join("");
    } else if (displayType == "decimal") {
      // dec case
      if (bitArray.includes("?")) {
        return "?";
      }
      return parseInt(bitArray.reverse().join(""), 2).toString();
    } else {
      throw new Error(`Invalid display type specified: ${displayType}`);
    }
  },
};
