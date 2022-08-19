import { it, expect } from "vitest";
import {
  bitArrayToString,
  byteSwap,
  getStringRepresentation,
  hex,
  wordSwap,
} from "./src/format";
import { stringToBitArray } from "./src/parse";
import { Bit } from "./src/types";

// Test the hex() function
// This function returns lowercase hex numbers
it("hex()", () => {
  expect(hex(0)).toBe("0x0");
  expect(hex(16)).toBe("0x10");
  expect(hex(305441741)).toBe("0x1234abcd");
});

// Test the getStringRepresentation() function
// This function turns a numeric value into a string
it("getStringRepresentation", () => {
  expect(getStringRepresentation(0, "hexadecimal", 1)).toBe("0");
  expect(getStringRepresentation(0, "binary", 1)).toBe("0");
  expect(getStringRepresentation(0, "decimal", 1)).toBe("0");

  expect(getStringRepresentation(43981, "hexadecimal", 32)).toBe("0x0000ABCD");
  expect(getStringRepresentation(15, "binary", 8)).toBe("0b00001111");
});

// Test the bitArrayToString() function
// This function turns Bit[] into a string rep
it("bitArrayToString", () => {
  let arr = [0, 0, 0, 0] as Bit[];
  expect(bitArrayToString(arr, "hexadecimal")).toBe("0x0");
  expect(bitArrayToString(arr, "binary")).toBe("0b0000");
  expect(bitArrayToString(arr, "decimal")).toBe("0");

  arr = [1, "?", 0, "?"];
  expect(bitArrayToString(arr, "hexadecimal")).toBe("0x?");
  expect(bitArrayToString(arr, "binary")).toBe("0b?0?1");
  expect(bitArrayToString(arr, "decimal")).toBe("?");

  arr = [1, 1, 1, 1, 0, 1, 0, 1];
  expect(bitArrayToString(arr, "hexadecimal")).toBe("0xAF");
  expect(bitArrayToString(arr, "binary")).toBe("0b10101111");
  expect(bitArrayToString(arr, "decimal")).toBe("175");
});

// Test the byteSwap() function
// This function will byte swap a bit array
it("byteSwap", () => {
  expect(byteSwap(stringToBitArray("0x0000_0000"))).toStrictEqual(
    stringToBitArray("0x0000_0000")
  );

  expect(byteSwap(stringToBitArray("0xAB", 8))).toStrictEqual(
    stringToBitArray("0xAB", 8)
  );

  expect(byteSwap(stringToBitArray("0xABCD_1234"))).toStrictEqual(
    stringToBitArray("0x3412_CDAB")
  );
});

// Test the wordSwap() function
// This function will word swap a bit array
it("wordSwap", () => {
  expect(wordSwap(stringToBitArray("0x0000_0000"))).toStrictEqual(
    stringToBitArray("0x0000_0000")
  );

  expect(wordSwap(stringToBitArray("0xABCD_1234"))).toStrictEqual(
    stringToBitArray("0x1234_ABCD")
  );

  expect(wordSwap(stringToBitArray("0xABCD", 16))).toStrictEqual(
    stringToBitArray("0xABCD", 16)
  );
});