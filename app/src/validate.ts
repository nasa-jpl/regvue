import { isUnknownBit } from "src/types";

// Ensures that a response has returned JSON content with non-zero length
// Returns an error message if invalid and "" for a valid response
export const validateResponse = (response: Response): string => {
  const contentType = response.headers.get("content-type");

  const contentLength = response.headers.get("content-length");
  if (contentLength == "0")
    return `URL returned ${contentType} with content-length 0.`;

  return "";
};

// Checks that JSON data conforms to the expected schema
// Returns an error message for invalid data and "" for valid data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validate = (data: any): string => {
  // Check that the schema field has the required fields
  if (!data.schema) return "Missing required field `schema`.";
  if (!data.schema.version) return "Missing required field `schema.version`.";
  if (!data.schema.name) return "Missing required field `schema.name`.";

  // Check that the root field has the required fields
  if (!data.root) return "Missing required field `root`.";
  if (!data.root.display_name)
    return "Missing required field `root.display_name`.";
  if (data.root.version) {
    if (typeof data.root.version != "string") {
      return 'Optional field `root.version` must be of type "string".';
    }
  }
  if (!data.root.children) return "Missing required field `root.children`.";

  // TODO check that data width is a supported value
  let dataWidth: number;
  if (data.root.data_width) {
    dataWidth = data.root.data_width;
  } else {
    dataWidth = 32;
  }

  // Check that the root.children field is a non-empty array
  if (data.root.children.constructor !== Array)
    return "Field `root.children` must be of type Array.";
  if (data.root.children.length == 0)
    return "Field `root.children` must have at least 1 root element.";

  if (!data.elements) return "Missing required field `elements`.";

  for (const childId of data.root.children) {
    if (typeof childId != "string")
      return `Root child ${childId} must be a string.`;

    // Check that each root child is in the data
    if (data.elements[childId] == undefined)
      return `Cannot find root child "${childId}" in data.elements.`;
  }

  // Check that each element has the required fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [key, element] of Object.entries(data.elements) as [string, any]) {
    if (!element) return `Element with key ${key} is unknown`;

    if (!element.id)
      return `Element with key "${key}" is missing required field \`id\`.`;

    if (!element.type)
      return `Element with key "${key}" is missing required field \`type\`.`;

    if (element.offset == undefined)
      return `Element with key "${key}" is missing required field \`offset\`.`;
    if (typeof element.offset != "number")
      return `Element with key "${key}" must have type "number" for required field \`offset\`.`;

    if (element.type == "include") {
      if (!element.url)
        return `IncludeElement with key "${key}" is missing required field \`url\`.`;
    } else {
      if (!element.name)
        return `Element with key "${key}" is missing required field \`name\`.`;

      if (element.children) {
        if (element.children.constructor !== Array)
          return `Element with key "${key}" must have type "Array" for field \`children\`.`;

        for (const childId of element.children) {
          if (typeof childId != "string")
            return `Child ${childId} of element "${key}" must be of type string.`;

          // Check that each root child is in the data
          if (data.elements[childId] == undefined)
            return `Cannot find child "${childId}" of element "${key}" in data.elements.`;
        }
      }
    }

    // Validate register specific arguments
    if (element.type == "reg") {
      // Validate the fields for register elements
      if (!element.fields)
        return `Register element "${element.id}" is missing required field \`fields\`.`;

      if (element.fields.constructor != Array)
        return `The \`fields\` of "${element.id}" must be an array.`;

      // Track the names of fields to prevent duplicates
      const names = new Set<string>();

      // Track how many bits are allocated between all the fields
      let sumOfNbits = 0;

      // Track which fields take up which bit indices
      const bitIndices = new Map<number, string>();

      for (const field of element.fields) {
        // Check that name is present and not a duplicate
        if (!field.name)
          return `A field of element "${element.id}" is missing required field \`name\`.`;

        if (names.has(field.name))
          return `Element "${element.id}" has more than one field named "${field.name}".`;
        names.add(field.name);

        if (!field.access)
          return `Field "${field.name}" of "${element.id}" is missing required field \`access\`.`;

        const resetValueErr = isValidResetValue(field.reset, dataWidth);
        if (resetValueErr != "") {
          return `Field "${field.name}" of "${element.id}" has an invalid reset value. ${resetValueErr}`;
        }

        // Check that lsb is a number in range
        if (field.lsb == undefined)
          return `Field "${field.name}" of "${element.id}" is missing required field \`lsb\`.`;

        if (typeof field.lsb != "number")
          return `Field "${field.name}" of "${element.id}" must have type "number" for required field \`lsb\`.`;

        if (field.lsb < 0 || field.lsb > dataWidth - 1)
          return `The value for \`lsb\` of field "${field.name}" of "${
            element.id
          }" is out of bounds. Valid \`lsb\` values must be in the range [0, ${
            dataWidth - 1
          }].`;

        // Check that nbits is a number within range
        if (field.nbits == undefined)
          return `Field "${field.name}" of "${element.id}" is missing required field \`nbits\`.`;

        if (typeof field.lsb != "number")
          return `Field "${field.name}" of "${element.id}" must have type "number" for required field \`nbits\`.`;

        if (field.nbits < 1 || field.nbits > dataWidth)
          return `The value for \`nbits\` of field "${field.name}" of "${element.id}" is out of bounds. Valid \`nbits\` values must be in the range [1, ${dataWidth}].`;

        for (let i = field.lsb; i < field.lsb + field.nbits; i++) {
          if (bitIndices.get(i))
            return `Field ${bitIndices.get(i)} and ${field.name} of ${
              element.id
            } overlap bit indices.`;
          bitIndices.set(i, field.name);
        }

        sumOfNbits += field.nbits;

        if (field.enum) {
          if (field.enum.constructor != Array) {
            return `Field "${field.name}" of "${element.id}" must have type "Array" for field \`enum\`.`;
          }

          for (const e of field.enum) {
            if (!e.name) {
              return `Field "${field.name}" of "${element.id}" has an \`enum\` value that is missing required field \`name\`.`;
            }

            if (typeof e.name != "string") {
              return `Enum \'${e.name}\' of field "${field.name}" of "${element.id}" must be of type string.`;
            }

            if (e.value == undefined) {
              return `Enum "${e.name}" of field "${field.name}" of "${element.id}" is missing required field \`value\`.`;
            }

            if (typeof e.value != "string" && typeof e.value != "number") {
              return `Enum "${e.name}" of field "${field.name}" of "${element.id}" must have type "string" or "number" for field \`value\`.`;
            }

            if (e.doc && typeof e.doc != "string") {
              return `Enum "${e.name}" of field "${field.name}" of "${element.id}" must have type "string" or "number" for field \`doc\`.`;
            }
          }
        }
      }

      if (sumOfNbits != dataWidth)
        return `The sum of \`field.nbits\` for every field of ${element.id} does not equal ${dataWidth}.`;
    }
  }

  return "";
};

// Given a reset value return an error message if it is invalid or "" otherwise
const isValidResetValue = (
  reset: string | number | { value: string; resets: string[] },
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

    if (reset.resets.constructor != Array) {
      return "`reset.resets` must be an array.";
    }

    for (const value of reset.resets) {
      if (typeof value != "string") {
        return `Value \`${JSON.stringify(value)}\` must be a string.`;
      }
    }
  }

  if (value.toLowerCase().startsWith("0x")) {
    // Return false if the value is too large
    if (value.substring(2).length > dataWidth / 4) {
      return `Value \`${value}\` is too large.`;
    }

    // Return false if any character is not a hex character or valid UnknownBit
    for (const char of value.substring(2)) {
      if (!/[0-9A-Fa-f]/.test(char) && !isUnknownBit(char)) {
        return `Value \`${value}\` contains an invalid hex char "${char}".`;
      }
    }
  } else if (value.toLowerCase().startsWith("0b")) {
    // Return false if the value is too large
    if (value.substring(2).length > dataWidth) {
      return `Value \`${value}\` is too large.`;
    }

    for (const char of value.substring(2)) {
      if (!/[0-1]/.test(char) && !isUnknownBit(char)) {
        return `Value \`${value}\` contains an invalid binary char "${char}".`;
      }
    }
  } else {
    // Characters must be a valid decimal character
    for (const char of value) {
      if (!/[0-9]/.test(char) && !isUnknownBit(char)) {
        return `Value \`${value}\` contains an invalid decimal char "${char}".`;
      }
    }
  }

  return "";
};
