import { RegisterField } from "./types";

// Provides formatting functions to convert various values to strings
export default {
  // Convert an integer to a hex string
  hex(value: number) {
    return "0x" + value.toString(16);
  },

  // Converts a field value to a string
  field_value(field: RegisterField, value: number) {
    if (field.nbits == 1) {
      return value;
    } else {
      return this.hex(value);
    }
  },
};
