import Ajv from "ajv";
import { isValidDataWidth, DesignRoot, DesignElement } from "src/types";
import parse from "src/parse";
import schema from "../../schema/register-description-format.schema.json";

const ajv = new Ajv({ allowUnionTypes: true });
const schemaValidator = ajv.compile(schema);

// Ensures that a response has returned JSON content with non-zero length
// Returns an error message if invalid and "" for a valid response
export const validateResponse = (response: Response): string => {
  const contentType = response.headers.get("content-type");

  const contentLength = response.headers.get("content-length");
  if (contentLength == "0")
    return `URL returned ${contentType} with content-length 0.`;

  return "";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateSchema = (data: any): string => {
  if (schemaValidator(data)) {
    return "";
  } else {
    console.error(schemaValidator.errors);
    const error = schemaValidator.errors?.at(0);

    if (error) {
      return `${error.instancePath} ${error.message}.`;
    } else {
      return "Error validating schema.";
    }
  }
};

// Checks that JSON data conforms to the expected schema
// Returns an error message for invalid data and "" for valid data
export const validateSemantics = (
  root: DesignRoot,
  elements: Map<string, DesignElement>
): string => {
  // Check that the data width is a supported value
  if (root.data_width) {
    if (!isValidDataWidth(root.data_width)) {
      return `Field \`root.data_width\` has invalid value \`${root.data_width}\`.`;
    }
  }

  for (const childId of root.children) {
    // Check that each root child is in the data
    if (elements.get(childId) == undefined)
      return `Cannot find root child "${childId}" in data.elements.`;
  }

  // Check that each element has the required fields
  for (const [key, element] of elements) {
    // Check that each root child is in the data
    if (element.children) {
      for (const childId of element.children) {
        if (elements.get(childId) == undefined)
          return `Cannot find child "${childId}" of element "${key}" in data.elements.`;
      }
    }

    // Validate that the offset is in a 32 bit address space
    if (parse.stringToBitArray((element.offset || 0).toString()).length > 32) {
      return `Element "${element.id}" has an offset greater than 32 bits.`;
    }
    if (parse.stringToBitArray((element.addr || 0).toString()).length > 32) {
      return `Element "${element.id}" has an address greater than 32 bits. Check that the sum of its offset and its ancestors' offsets don't exceed 32 bits`;
    }

    // Validate register specific arguments
    if (element.type == "reg") {
      if (!element.fields) {
        throw Error(`Element "${element.id}" is missing fields`);
      }

      // Track the names of fields to prevent duplicates
      const names = new Set<string>();

      // Track how many bits are allocated between all the fields
      let sumOfNbits = 0;

      // Track which fields take up which bit indices
      const bitIndices = new Map<number, string>();

      for (const field of element.fields) {
        if (names.has(field.name))
          return `Element "${element.id}" has more than one field named "${field.name}".`;
        names.add(field.name);

        const resetValueErr = isValidResetValue(field.reset, field.nbits);
        if (resetValueErr != "") {
          return `Field "${field.name}" of "${element.id}" has an invalid reset value. ${resetValueErr}`;
        }

        // Check that lsb is a number in range
        if (field.lsb < 0 || field.lsb > element.data_width - 1)
          return `The value for \`lsb\` of field "${field.name}" of "${
            element.id
          }" is out of bounds. Valid \`lsb\` values must be in the range [0, ${
            element.data_width - 1
          }].`;

        // Check that nbits is a number within range
        if (field.nbits < 1 || field.nbits > element.data_width)
          return `The value for \`nbits\` of field "${field.name}" of "${element.id}" is out of bounds. Valid \`nbits\` values must be in the range [1, ${element.data_width}].`;

        for (let i = field.lsb; i < field.lsb + field.nbits; i++) {
          if (bitIndices.get(i))
            return `Field ${bitIndices.get(i)} and ${field.name} of ${
              element.id
            } overlap bit indices.`;
          bitIndices.set(i, field.name);
        }

        sumOfNbits += field.nbits;

        if (field.enum) {
          // Ensure no duplicate enum names or values
          const enumNames = new Set();
          const enumValues = new Set();
          for (const e of field.enum) {
            if (enumNames.has(e.name)) {
              return `Field "${field.name} of element "${element.id}" has more than one enum associated with the name "${e.name}".`;
            }
            enumNames.add(e.name);

            if (enumValues.has(e.value)) {
              return `Field "${field.name} of element "${element.id}" has more than one enum associated with the value "${e.value}".`;
            }
            enumValues.add(e.value);
          }
        }
      }

      if (sumOfNbits != element.data_width)
        return `The sum of \`field.nbits\` for every field of ${element.id} does not equal ${element.data_width}.`;
    }
  }

  return "";
};

// Given a reset value return an error message if it is invalid or "" otherwise
const isValidResetValue = (
  reset: string | number | { value: string | number; resets: string[] },
  dataWidth: number
): string => {
  let value: string;

  // An undefined reset value is set to be "?" in store.ts, so it's okay
  if (reset == undefined) {
    return "";
  }

  // Case with single unnamed reset
  else if (typeof reset == "string" || typeof reset == "number") {
    value = reset.toString();
  }

  // Case with named reset states
  else {
    value = reset.value.toString();
  }

  if (value.toLowerCase().startsWith("0x")) {
    // Return false if the value is too large
    if (value.substring(2).length > Math.ceil(dataWidth / 4)) {
      return `Value \`${value}\` is too large.`;
    }
  } else if (value.toLowerCase().startsWith("0b")) {
    // Return false if the value is too large
    if (value.substring(2).length > dataWidth) {
      return `Value \`${value}\` is too large.`;
    }
  }

  return "";
};
