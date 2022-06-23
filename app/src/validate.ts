// Given a collection of JSON data assert:
// 1. All required fields are present
// 2. All fields have the required data type

// On failure return an error message
// On success return ""

export const validateResponse = (response: Response): string => {
  const contentType = response.headers.get("content-type");
  if (contentType != "application/json")
    return `URL returned ${contentType}, not application/json.`;

  const contentLength = response.headers.get("content-length");
  if (contentLength == "0")
    return `URL returned ${contentType} with content-length 0.`;

  return "";
};

export const validate = (data: any): string => {
  // Check that the schema field has the required fields
  if (!data.schema) return "Missing required field `schema`.";
  if (!data.schema.version) return "Missing required field `schema.version`.";
  if (!data.schema.name) return "Missing required field `schema.name`.";

  // Check that the root field has the required fields
  if (!data.root) return "Missing required field `root`.";
  if (!data.root.display_name)
    return "Missing required field `root.display_name`.";
  if (!data.root.version) return "Missing required field `root.version`.";
  if (!data.root.children) return "Missing required field `root.children`.";

  // Check that the root.children field is a non-empty array
  if (data.root.children.constructor !== Array)
    return "Field `root.children` must be of type Array";
  if (data.root.children.length == 0)
    return "Field `root.children` must have at least 1 root element.";

  // Check that each element has the required fields
  if (!data.elements) return "Missing required field `elements`.";
  for (const [key, element] of Object.entries(data.elements) as [string, any]) {
    if (!element) return `Element with key ${key} is unknown`;

    if (!element.id)
      return `Element with key "${key}" is missing required field \`id\``;

    if (!element.name)
      return `Element with key "${key}" is missing required field \`name\``;

    if (element.offset == undefined)
      return `Element with key "${key}" is missing required field \`offset\``;
    if (typeof element.offset != "number")
      return `Element with key "${key}" must have type "number" for required field \`offset\`.`;

    if (!element.type)
      return `Element with key "${key}" is missing required field \`type\``;

    // Validate the fields
    if (element.fields) {
      if (element.fields.constructor != Array)
        return `The \`fields\` field of ${element.id} must be an array.`;

      for (const field of element.fields) {
        if (!field.name)
          return `A field of element "${element.id}" is missing required field \`name\`.`;

        if (!field.access)
          return `Field "${field.name}" of "${element.id}" is missing required field \`access\`.`;

        if (field.reset == undefined)
          return `Field "${field.name}" of "${element.id}" is missing required field \`reset\`.`;

        // Check that lsb is a number in range
        if (field.lsb == undefined)
          return `Field "${field.name}" of "${element.id}" is missing required field \`lsb\`.`;

        if (typeof field.lsb != "number")
          return `Field "${field.name}" of "${element.id}" must have type "number" for required field \`lsb\`.`;

        if (field.lsb < 0 || field.lsb > 31)
          return `The value for \`lsb\` of field "${field.name}" of "${element.id}" is out of bounds. Valid \`lsb\` values must be in the range [0, 31].`;

        // Check that nbits is a number within range
        if (field.nbits == undefined)
          return `Field "${field.name}" of "${element.id}" is missing required field \`nbits\`.`;

        if (typeof field.lsb != "number")
          return `Field "${field.name}" of "${element.id}" must have type "number" for required field \`nbits\`.`;

        if (field.lsb < 0 || field.lsb > 31)
          return `The value for \`nbits\` of field "${field.name}" of "${element.id}" is out of bounds. Valid \`nbits\` values must be in the range [0, 31].`;
      }
    }
  }

  return "";
};
