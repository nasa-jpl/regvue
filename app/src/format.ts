import { RegisterField, DisplayType } from "./types";

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
};
