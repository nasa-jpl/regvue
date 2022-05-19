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
};
