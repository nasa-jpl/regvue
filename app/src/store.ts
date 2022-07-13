import { defineStore } from "pinia";
import {
  DataWidth,
  DesignElement,
  DesignRoot,
  DisplayType,
  Field,
  IncludeElement,
  RegisterDescriptionFile,
} from "src/types";
import format from "src/format";
import parse from "src/parse";
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
    // Returns the first element in elements that has type "reg"
    getFirstRegister() {
      for (const key of this.elements.keys()) {
        if (this.elements.get(key)?.type == "reg") {
          return key;
        }
      }

      return "";
    },

    // Try to get data from a url and call load() with that data
    // Return true on successful load and false if load fails
    async loadUrl(url: string) {
      try {
        // Fetch and validate the response
        const result = await fetch(url);
        let validateMsg = validateResponse(result);
        if (validateMsg) return validateMsg;

        // Validate the JSON data's schema
        const data = await result.json();
        validateMsg = validateSchema(data);
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
      const [elements, root] = (await formatData(data.elements, data.root)) as [
        Map<string, DesignElement>,
        DesignRoot
      ];

      if (!elements) throw Error("Error formating data");
      if (!root) throw Error("Error updating DesignRoot");

      for (const [, element] of elements.entries()) {
        // Calculate the address from an element's offset and its parents' offsets
        element.addr = getAddress(element.id, elements);

        // Get an elements data_width
        element.data_width = getDataWidth(element, elements, root);

        // Set the default reset state
        if (element.type == "reg") {
          element.default_reset = getDefaultResetState(element, elements, root);

          // If a field reset value has no associated reset states, add the default state
          element.fields?.forEach((field) => {
            if (field.reset.resets.length == 0) {
              field.reset.resets = [element.default_reset as string];
            }
          });

          // Sort the fields so that the field with the highest LSB is first in the array
          element.fields?.sort((a, b) => b.lsb - a.lsb);
        }
      }

      // Check the semantic details of the parsed data
      const errorMessage = validateSemantics(root, elements);
      if (errorMessage) throw Error(errorMessage);

      this.elements = elements;
      this.root = root;
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
  root: DesignRoot
) => {
  const formattedElements = new Map<string, DesignElement>();

  for (const element of Object.values(elements)) {
    // If the element is an IncludeElement fetch and format from its url
    if (element.type == "include") {
      try {
        const response = await fetch(element.url);
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
          display_name: element.display_name,
          addr: 0,
          offset: element.offset,
          type: "blk",
          doc: element.doc,
          version: element.version,
          children: [],
          data_width: json.root.data_width
            ? json.root.data_width
            : element.data_width,
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
        const [newData] = (await formatData(data, root)) as [
          Map<string, DesignElement>,
          unknown
        ];

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

    // If the element is not an IncludeElement, format its fields and add to formattedElements map
    else {
      const fields = element.fields;

      // Set the field.value to be a Bit[] that represents the field.reset or 0
      fields?.forEach((field: Field) => {
        if (typeof field.reset == "string" || typeof field.reset == "number") {
          field.reset = { value: field.reset, resets: [] };
          field.value = parse.stringToBitArray(
            field.reset.value.toString(),
            field.nbits
          );
        } else if (field.reset && field.reset.value != undefined) {
          field.value = parse.stringToBitArray(
            field.reset.value.toString(),
            field.nbits
          );
        } else {
          field.value = parse.stringToBitArray("?", field.nbits);
          field.reset = {
            value: format.bitArrayToString(field.value, "hexadecimal"),
            resets: [],
          };
        }
      });
      formattedElements.set(element.id, element);
    }
  }

  return [formattedElements, root];
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
      if (root.default_reset) {
        return root.default_reset;
      } else {
        return "Default";
      }
    }

    const parentDefaultReset = getDefaultResetState(parentElem, elements, root);
    return parentDefaultReset;
  }

  return element.default_reset;
};

// Helper function to get an element's address from its and its parents' offsets
const getAddress = (
  key: string,
  elements: Map<string, { offset?: number | string }>
) => {
  // How many elements are there in hierachy (e.g. blk.sub_blk.reg => 3)
  const count = key.split(".").length + 1;

  // Add up the offset of every element along the current key's hierarchy
  let result;
  for (let i = 1; i < count; i++) {
    const id = key.split(".").slice(0, i).join(".");
    const elem = elements.get(id);
    if (!elem) throw Error(`Could not find element ${id} (${i})`);

    if (elem.offset !== undefined) {
      if (result === undefined) result = 0;
      result += parseInt(elem.offset.toString());
    }
  }
  return result;
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
