import format from "./format";
import { Bit } from "./types";

// Provides various string parsing functions
export default {
  // Parses numeric values in various formats
  //
  // Supports various bases.  See base().
  //
  // Supports '_' separators.
  num(s: string) {
    const { str, base } = this.base(s.trim());
    return parseInt(str.replaceAll("_", ""), base);
  },
  // Parses the base of a numeric value
  //
  // Supports:
  //
  // * Base 2 - '0b' prefix
  // * Base 10 - no prefix
  // * Base 16 - '0x' prefix
  base(s: string) {
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
  },

  stringToBitArray(value: string, length = 32) {
    const res: Bit[] = [];
    value = value.replaceAll("_", "");
    if (value.substring(0, 2) == "0x") {
      // hex case
      for (const char of value.substring(2)) {
        // Look at each hex decimal
        if (char == "?") {
          for (let i = 0; i < length / 8; i++) res.push("?");
        } else {
          const value = this.num("0x" + char);
          const binaryString = format.getStringRepresentation(
            value,
            "binary",
            4
          );

          for (const digit of binaryString.substring(2)) {
            res.push(parseInt(digit) as Bit);
          }
        }
      }
      for (let i = res.length; i < length; i++) {
        res.unshift(0);
      }
    } else if (value.substring(0, 2) == "0b") {
      //binary case
      for (const char of value.substring(2)) {
        if (char == "?") res.push(char);
        else res.push(parseInt(char) as Bit);
      }

      console.log(`appending ${length - res.length} 0's to top`);
      for (let i = res.length; i < length; i++) {
        res.unshift(0);
      }
      return res.reverse();
    } else {
      //decimal case
      if (value.includes("?")) {
        for (let i = 0; i < length; i++) res.push("?");
      } else {
        const num = this.num(value);
        const binaryString = num.toString(2);
        for (const char of binaryString) {
          res.push(parseInt(char) as Bit);
        }
      }

      for (let i = res.length; i < length; i++) {
        res.unshift(0);
      }
    }

    return res.reverse();
  },
};
