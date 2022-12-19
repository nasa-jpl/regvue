import { it, expect } from "vitest";
import { getBase, num, stringToBitArray, parseBigInt } from "src/parse";
import { Bit } from "src/types";
import bigInt from "big-integer";

// Test the getBase() function
it("getBase", () => {
  expect(getBase("0b1010")).toStrictEqual({ str: "1010", base: 2 });
  expect(getBase("0xABCD")).toStrictEqual({ str: "abcd", base: 16 });
  expect(getBase("1234")).toStrictEqual({ str: "1234", base: 10 });
});

// Test the num() function
it("num", () => {
  expect(num("0b1010")).toBe(10);
  expect(num("0b1111_1111")).toBe(255);

  expect(num("0xA")).toBe(10);
  expect(num("0xFF")).toBe(255);

  expect(num("10")).toBe(10);
  expect(num("255")).toBe(255);
});

// Test the stringToBitArray() function
it("stringToBitArray", () => {
  let res = [1, 1, 1, 1] as Bit[];
  expect(stringToBitArray("0xF", 4)).toStrictEqual(res);
  expect(stringToBitArray("0b1111", 4)).toStrictEqual(res);
  expect(stringToBitArray("15", 4)).toStrictEqual(res);

  res = ["?", "?", "?", "?", 0, 1, 0, 1, 0, 0, 0, 0];
  expect(stringToBitArray("0xA?", 12)).toStrictEqual(res);

  res = [0, 0, 0, "?", 0, 1, 0, 1, 0, 0, 0, 0];
  expect(stringToBitArray("0b1010?000", 12)).toStrictEqual(res);

  res = new Array(12).fill("?");
  expect(stringToBitArray("?", 12)).toStrictEqual(res);
});

// Test the parseBigInt() function
it("parseBigInt", () => {
  expect(parseBigInt("0xABCD")).toStrictEqual(bigInt("ABCD", 16));
  expect(parseBigInt("0b1010")).toStrictEqual(bigInt("1010", 2));
  expect(parseBigInt("1234")).toStrictEqual(bigInt("1234"));
});
