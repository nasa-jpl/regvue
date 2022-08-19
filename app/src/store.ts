import { defineStore } from "pinia";
import {
  DataWidth,
  DesignElement,
  DesignRoot,
  DisplayType,
  IncludeElement,
  RegisterDescriptionFile,
} from "src/types";
import { bitArrayToString } from "src/format";
import { stringToBitArray } from "src/parse";
import {
  validateSchema,
  validateSemantics,
  validateResponse,
} from "src/validate";

const DEFAULT_DATA_WIDTH = 32;
const DEFAULT_DEFAULT_RESET = "Default";
const DEFAULT_DISPLAY_TYPE = "hexadecimal" as DisplayType;

export const useStore = defineStore("store", {
  state: () => {
    return {
      // Object representing info about the overall design (e.g. name, version, and root elements)
      root: {} as DesignRoot,

      // A map of <element id : DesignElement> for elements (reg/blk/mem) in the design
      elements: new Map<string, DesignElement>(),

      // Whether or not the store is currently loading a file
      isLoading: false,

      // Whether or not store.load() has been called successfully
      loaded: false,

      // URL where the Register Description File was loaded from ("" for local files)
      url: "",

      // Whether or not to display the register value as byte swapped in RegLayout
      useByteSwap: false,

      // Whether or not to display the register value as word swapped in RegLayout
      useWordSwap: false,

      // Which display type to show field and register values as in RegLayout
      selectedDisplayType: DEFAULT_DISPLAY_TYPE,

      // Any text to show in the footer
      footerText: "",
    };
  },
  actions: {
    // Try to get data from a url and call load() with that data
    // Return "" on successful load and an error string if load fails
    async loadUrl(url: string) {
      this.isLoading = true;
      let ret = "";

      try {
        // Fetch and validate the response
        const result = await fetch(url);
        let validateMsg = validateResponse(result);
        if (validateMsg) throw Error(validateMsg);

        const data = await result.json();

        // Validate the JSON data's schema
        validateMsg = validateSchema(data);
        if (validateMsg) throw Error(validateMsg);

        // If the data is valid then load the data
        await this.load(data, url);
      } catch (e) {
        console.error(e);
        ret = e as string;
      }

      this.isLoading = false;
      return ret;
    },

    // Try to load the store by parsing the provided JSON string
    // Return "" on successful load and an error string if load fails
    async loadFile(jsonString: string) {
      this.isLoading = true;
      let ret = "";

      try {
        const data = await JSON.parse(jsonString);

        // Validate the JSON data's schema
        const validateMsg = validateSchema(data);
        if (validateMsg) throw Error(validateMsg);

        // If the data is valid then load the data
        await this.load(data);
      } catch (e) {
        console.error(e);
        ret = e as string;
      }

      this.isLoading = false;
      return ret;
    },

    // Parse JSON data and populate the store variables
    async load(data: RegisterDescriptionFile, url = "") {
      getFooterText().then((text) => (this.footerText = text));

      const baseUrl = url.slice(0, url.lastIndexOf("/") + 1);
      const elements = await formatData(data.elements, baseUrl);

      if (data.root.data_width === undefined) {
        data.root.data_width = DEFAULT_DATA_WIDTH;
      }

      for (const element of elements.values()) {
        // Calculate the address from an element's offset and its parents' offsets
        element.addr = getAddress(element.id, elements);

        // Get an elements data_width
        element.data_width = getDataWidth(element, elements, data.root);

        if (element.type == "reg") {
          // Associate each field with the appropriate named reset states
          formatResets(element, elements, data.root);
        }
      }

      // Check the semantic details of the parsed data
      const errorMessage = validateSemantics(data.root, elements);
      if (errorMessage) throw Error(errorMessage);

      this.elements = elements;
      this.loaded = true;
      this.root = data.root;
      this.url = url;
    },
  },
});

// Transforms an RDF JSON file into a map of formatted DesignElements
// Will fetch and replace any IncludeElements
const formatData = async (
  elements: { [key: string]: DesignElement | IncludeElement },
  baseUrl: string
) => {
  // Create a Map to store formatted elements as <element id: formatted DesignElement>
  const formattedElements = new Map<string, DesignElement>();

  await Promise.all(
    Object.values(elements).map(async (element) => {
      // Reassign the offset to be a BigInt
      if (element.offset !== undefined) {
        element.offset = BigInt(element.offset);
      }

      if (element.type != "include") {
        formattedElements.set(element.id, element);
      }
      // If the element is an IncludeElement then fetch from its url and format the fetched data
      else {
        try {
          // If the url is not absolute, prepend the base URL
          let url = element.url;
          if (!isAbsoluteUrl(element.url)) {
            url = baseUrl + element.url;
          }

          // Fetch an RDF from the IncludeElement's URL
          const response = await fetch(url);
          const json = (await response.json()) as RegisterDescriptionFile;

          // Validate the JSON data's schema
          const validateMsg = validateSchema(json);
          if (validateMsg) {
            throw Error(`Schema error at ${element.url}.\n${validateMsg}`);
          }

          // Merge the IncludeElement and the fetched Root into a blk DesignElement
          const mergedElement = mergeIncludeElement(element, json);
          formattedElements.set(mergedElement.id, mergedElement);

          // From the fetched JSON data, create a formatted map of string keys to DesignElements
          const data = {} as {
            [key: string]: DesignElement | IncludeElement;
          };
          for (const child of Object.values(json.elements)) {
            data[child.id] = child;
          }
          const newData = await formatData(data, baseUrl);

          // Merge together the new DesignElements with the previously collected elements
          for (const [key, value] of newData.entries()) {
            formattedElements.set(key, value);
          }
        } catch (e) {
          console.error(e);
          throw Error(e as string);
        }
      }
    })
  );

  return formattedElements;
};

// Combines an IncludeElement with a fetched Root object to create a blk DesignElement
const mergeIncludeElement = (
  includeElement: IncludeElement,
  json: RegisterDescriptionFile
): DesignElement => {
  // Create a DesignElement by combining the properties of the IncludeElement and the fetched DesignRoot
  // Prefers properties on the IncludeElement over the fetched DesignRoot
  const elem = {
    id: includeElement.id,
    name: includeElement.name,
    type: "blk",
    desc: includeElement.desc ? includeElement.desc : json.root.desc,
    offset:
      includeElement.offset !== undefined
        ? BigInt(includeElement.offset)
        : undefined,
    links: includeElement.links ? includeElement.links : json.root.links,
    doc: includeElement.doc ? includeElement.doc : json.root.doc,
    version: includeElement.version
      ? includeElement.version
      : json.root.version,
    default_reset: json.root.default_reset
      ? json.root.default_reset
      : DEFAULT_DEFAULT_RESET,
    resets: json.root.default_reset ? [json.root.default_reset] : [],
    data_width: includeElement.data_width
      ? includeElement.data_width
      : json.root.data_width,
    addr: BigInt(0), // Will be updated in load() by a call to getAddress()
    children: [], // Populated below
  } as DesignElement;

  // Add the children of the fetched DesignRoot as children of the block element
  for (const childId of Object.values(json.root.children)) {
    elem.children?.push([elem.id, childId].join("."));
  }

  // Modify the fetched children id's
  for (const child of Object.values(json.elements)) {
    child.id = [elem.id, child.id].join(".");

    // Append the block element's id to each child of the fetched JSON element
    if (child.type != "include" && child.children) {
      child.children = child.children.map((id) => [elem.id, id].join("."));
    }
  }

  return elem;
};

// Will assign each reset value for each field with the appropriate named reset states
const formatResets = (
  element: DesignElement,
  elements: Map<string, DesignElement>,
  root: DesignRoot
) => {
  // Create a list to track possible reset states
  // The default reset state is placed at the 0 index to begin
  element.resets = [getDefaultResetState(element, elements, root)];

  if (element.fields) {
    for (const field of element.fields) {
      // If there is an unnamed reset, associate it with the default reset
      if (typeof field.reset == "string" || typeof field.reset == "number") {
        field.reset = {
          value: field.reset, // Preserve the original reset value
          names: element.resets[0] ? [element.resets[0]] : [], // But associate it with the default reset
        };
        field.value = stringToBitArray(
          field.reset.value.toString(),
          field.nbits
        );
      }
      // If there are named resets, use the default reset to set the value if present
      // If the default reset is not present, set the value to "?"
      else if (field.reset && field.reset.names) {
        // If the default reset is associated with a reset value
        if (field.reset.names.includes(element.resets[0] as string)) {
          // Then set the value to the default reset value
          field.value = stringToBitArray(
            field.reset.value.toString(),
            field.nbits
          );
        }
        // Otherwise set the field value to "?"
        else {
          field.value = stringToBitArray("?", field.nbits);
        }

        // Add any missing reset states to the element's overall resets
        for (const reset of field.reset.names) {
          if (!element.resets.includes(reset)) {
            element.resets.push(reset);
          }
        }
      }
      // If there is no reset value for the field set the value to "?"
      else {
        field.value = stringToBitArray("?", field.nbits);
        field.reset = {
          value: bitArrayToString(field.value, "hexadecimal"),
          names: [],
        };
      }
    }
  }

  // Sort the fields so that the field with the highest LSB is first in the array
  element.fields?.sort((a, b) => b.lsb - a.lsb);
};

// Helper function to get an element's address from its and its ancestors' offsets
const getAddress = (
  key: string,
  elements: Map<string, { offset?: bigint }>
): bigint | undefined => {
  // Get the current element's offset
  const offset = elements.get(key)?.offset;

  // If the offset is undefined then the addr should be undefined
  if (offset === undefined) {
    return undefined;
  }

  // If the key of the element has a ".", then it has parent elements
  if (key.includes(".")) {
    // Get the parent's offset
    const parentId = key.split(".").slice(0, -1).join(".");
    const parentOffset = getAddress(parentId, elements);

    // If the parent has a defined offset, add it to find the child's addr
    if (parentOffset === undefined) {
      return offset;
    } else {
      return offset + parentOffset;
    }
  } else {
    return offset;
  }
};

// Return an element's data width in nbits
// If not found on element, return the first valid data width of an ancestor
const getDataWidth = (
  element: DesignElement,
  elements: Map<string, DesignElement>,
  root: DesignRoot
): DataWidth => {
  if (!element.data_width) {
    const parentElem = getParent(element.id, elements);
    if (!parentElem) {
      if (root.data_width) {
        return root.data_width;
      } else {
        return DEFAULT_DATA_WIDTH;
      }
    }

    const parentDataWidth = getDataWidth(parentElem, elements, root);
    return parentDataWidth;
  }

  return element.data_width;
};

// Get the footer text from app.config.json
const getFooterText = async (): Promise<string> => {
  try {
    const configInfo = await fetch("app.config.json").then((response) =>
      response.json()
    );
    return configInfo.footer ? configInfo.footer : "";
  } catch {
    return "";
  }
};

// Return an element's default reset state
// If not found on element, return the first default reset state of an ancestor
const getDefaultResetState = (
  element: DesignElement,
  elements: Map<string, DesignElement>,
  root: DesignRoot
): string => {
  if (!element.default_reset) {
    const parentElem = getParent(element.id, elements);
    if (!parentElem) {
      return root.default_reset;
    }

    const parentDefaultReset = getDefaultResetState(parentElem, elements, root);
    return parentDefaultReset;
  }

  return element.default_reset;
};

// Return the parent element of a given element
const getParent = (elementId: string, elements: Map<string, DesignElement>) => {
  const arr = elementId.split(".");
  const parentId = arr.slice(0, arr.length - 1).join(".");

  const parentElement = elements.get(parentId);
  if (!parentElement) return null;
  return parentElement;
};

// Returns true is a given URL is absolute (i.e. https://example.com/data.json)
// returns false is a given URL is relative (i.e. data.json)
const isAbsoluteUrl = (url: string): boolean => {
  return url.includes("://");
};
