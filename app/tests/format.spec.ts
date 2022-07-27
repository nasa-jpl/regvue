import { it, expect } from "vitest";
import { hex, getStringRepresentation } from "./src/format";

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
