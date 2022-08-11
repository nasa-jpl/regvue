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

export const useStore = defineStore("store", {
  state: () => {
    return {
      // Object representing info about the overall design (e.g. name, version, and root elements)
      root: {} as DesignRoot,

      // A map of id : DesignElement for elements (reg/blk/mem) in the design
      elements: new Map<string, DesignElement>(),

      // Whether or not store.load() has been called successfully
      loaded: false,

      // URL where the Register Description File was loaded from ("" for local files)
      url: "",

      // Whether or not to display the register value as byte swapped in RegLayout
      useByteSwap: false,

      // Which display type to show field and register values as in RegLayout
      selectedDisplayType: "hexadecimal" as DisplayType,

      // Any text to show in the footer
      footerText: "",
    };
  },
  actions: {
    // Try to get data from a url and call load() with that data
    // Return true on successful load and false if load fails
    async loadUrl(url: string) {
      try {
        // Fetch and validate the response
        const result = await fetch(url);
        let validateMsg = validateResponse(result);
        if (validateMsg) return validateMsg;

        const data = await result.json();
        validateMsg = validateSchema(data);

        // Validate the JSON data's schema
        if (validateMsg) return validateMsg;

        // If the data is valid load the data
        await this.load(data, url);
        return "";
      } catch (e) {
        console.error(e);
        return e as string;
      }
    },

    // Try load the store by parsing the provided JSON string
    // Return true on successful load and false if load fails
    async loadFile(jsonString: string) {
      try {
        const data = await JSON.parse(jsonString);

        // Validate the JSON data's schema
        const validateMsg = validateSchema(data);
        if (validateMsg) return validateMsg;

        await this.load(data);
        return "";
      } catch (e) {
        console.error(e);
        return e as string;
      }
    },

    // Parse JSON data and populate the store variables
    async load(data: RegisterDescriptionFile, url = "") {
      const baseUrl = url.slice(0, url.lastIndexOf("/") + 1);
      const elements = await formatData(data.elements, baseUrl);

      if (!elements) throw Error("Error formating data");

      for (const [, element] of elements.entries()) {
        // Calculate the address from an element's offset and its parents' offsets
        element.addr = getAddress(element.id, elements);

        // Get an elements data_width
        element.data_width = getDataWidth(element, elements, data.root);

        // Create a list of possible reset states
        // The default reset state is placed at the 0 index to begin
        if (element.type == "reg") {
          element.resets = [getDefaultResetState(element, elements, data.root)];

          if (element.fields) {
            for (const field of element.fields) {
              // If there is an unnamed reset, associate it with the default reset
              if (
                typeof field.reset == "string" ||
                typeof field.reset == "number"
              ) {
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
        }
      }

      if (!data.root.data_width) {
        data.root.data_width = 32;
      }

      // Check the semantic details of the parsed data
      const errorMessage = validateSemantics(data.root, elements);
      if (errorMessage) throw Error(errorMessage);

      this.elements = elements;
      this.root = data.root;
      this.url = url;
      this.loaded = true;

      // Get the footer text from app.config.json
      try {
        const configInfo = await fetch("app.config.json").then((response) =>
          response.json()
        );
        this.footerText = configInfo.footer;
      } catch {
        this.footerText = "";
      }
    },
  },
});

const formatData = async (
  elements: { [key: string]: DesignElement | IncludeElement },
  baseUrl: string
) => {
  const formattedElements = new Map<string, DesignElement>();

  for (const element of Object.values(elements)) {
    // Reassign the offset to be a BigInt
    if (element.offset !== undefined) {
      element.offset = BigInt(element.offset);
    }

    // If the element is an IncludeElement fetch and format from its url
    if (element.type == "include") {
      try {
        let url = element.url;

        // If the url is not absolute, prepend the base URL
        if (!isAbsoluteUrl(element.url)) {
          url = baseUrl + element.url;
        }

        const response = await fetch(url);
        const json = (await response.json()) as RegisterDescriptionFile;

        // Validate the JSON data's schema
        const validateMsg = validateSchema(json);
        if (validateMsg) {
          throw Error(`Schema error at ${element.url}.\n${validateMsg}`);
        }

        const data = {} as { [key: string]: DesignElement | IncludeElement };

        // Get the id of the parent of the current IncludeElement
        const idArr = element.id.split(".");
        let parentId: string;
        if (idArr.length == 1) {
          parentId = "";
        } else {
          parentId = idArr.slice(0, idArr.length - 1).join(".");
        }

        const elem = {
          id: element.id,
          name: element.name,
          desc: element.desc ? element.desc : json.root.desc,
          addr: BigInt(0),
          offset:
            element.offset !== undefined ? BigInt(element.offset) : undefined,
          type: "blk",
          links: element.links ? element.links : json.root.links,
          doc: element.doc ? element.doc : json.root.doc,
          version: element.version ? element.version : json.root.version,
          children: [],
          default_reset: json.root.default_reset
            ? json.root.default_reset
            : "Default",
          resets: json.root.default_reset ? [json.root.default_reset] : [],
          data_width: element.data_width
            ? element.data_width
            : json.root.data_width,
        } as DesignElement;

        // Add the children of the root as children of the include block
        for (const childId of Object.values(json.root.children)) {
          elem.children?.push([elem.id, childId].join("."));
        }

        for (const child of Object.values(json.elements)) {
          // Append the parentId to the id of the fetched json element
          child.id = [elem.id, child.id].join(".");

          // Append the parentId to each child of the fetched JSON element
          if (child.type != "include" && child.children && parentId) {
            child.children = child.children.map((id) =>
              [elem.id, id].join(".")
            );
          }

          data[child.id] = child;
        }

        // From the fetched JSON data create a map of string keys to DesignElements
        const newData = await formatData(data, baseUrl);

        // Merge together the new DesignElements with the previously collected elements
        formattedElements.set(elem.id, elem);
        for (const [key, value] of newData.entries()) {
          formattedElements.set(key, value);
        }
      } catch (e) {
        console.error(e);
        throw Error(e as string);
      }
    }

    // Otherwise add it to formattedElements map
    else {
      formattedElements.set(element.id, element);
    }
  }

  return formattedElements;
};

// Return the parent element of a given element
const getParent = (elementId: string, elements: Map<string, DesignElement>) => {
  const arr = elementId.split(".");
  const parentId = arr.slice(0, arr.length - 1).join(".");

  const parentElement = elements.get(parentId);
  if (!parentElement) return null;
  return parentElement;
};

// Return an element's default reset state
// If not found on element, return the default reset state of nearest ancestor
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

// Helper function to get an element's address from its and its parents' offsets
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
// If not found on element, return the data width of the nearest ancestor with one set
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
        return 32;
      }
    }

    const parentDataWidth = getDataWidth(parentElem, elements, root);
    return parentDataWidth;
  }

  return element.data_width;
};

// Returns true is a given URL is absolute (i.e. https://example.com/data.json)
// returns false is a given URL is relative (i.e. data.json)
const isAbsoluteUrl = (url: string): boolean => {
  return url.includes("://");
};
