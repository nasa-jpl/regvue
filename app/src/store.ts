import { defineStore } from "pinia";
import {
  DesignElement,
  DesignRoot,
  DisplayType,
  Field,
  IncludeElement,
  RegisterDescriptionFile,
} from "src/types";
import format from "src/format";
import parse from "src/parse";
import { validate, validateResponse } from "src/validate";

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

        // Validate the JSON data
        const data = await result.json();
        validateMsg = validate(data);
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

        const validateMsg = validate(data);
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

      // If the data_width is undefined default to 32 bits
      if (!root.data_width) {
        root.data_width = 32;
      }

      for (const [, element] of elements.entries()) {
        // Calculate the address from an element's offset and its parents' offsets
        element.addr = getAddress(element.id, elements);

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

        const data = {} as { [key: string]: DesignElement | IncludeElement };

        // Get the id of the parent of the current IncludeElement
        const idArr = element.id.split(".");
        let parentId: string;
        if (idArr.length == 1) {
          parentId = "";
        } else {
          parentId = idArr.slice(0, idArr.length - 1).join(".");
        }

        // Replace any references to the include block with the json data it references for the root
        const idx = root.children.indexOf(element.id);
        if (idx >= 0) {
          root.children = [
            ...root.children.slice(0, idx),
            ...json.root.children.map((childId) =>
              parentId ? [parentId, childId].join(".") : childId
            ),
            ...root.children.slice(idx + 1),
          ];
        }

        // Replace any reference to the include block with the json data it references for previous
        // formattedElement values
        for (const [_, formattedElement] of formattedElements.entries()) {
          const idx = formattedElement.children?.indexOf(element.id) || -1;
          if (idx >= 0 && parentId && formattedElement.children) {
            formattedElement.children = [
              ...formattedElement.children.slice(0, idx),
              ...json.root.children.map((childId) =>
                [parentId, childId].join(".")
              ),
              ...formattedElement.children.slice(idx + 1),
            ];
          }
        }

        for (const child of Object.values(json.elements)) {
          // Append the parentId to the id of the fetched json element
          if (parentId) {
            child.id = [parentId, child.id].join(".");
          }

          // Append the parentId to each child of the fetched JSON element
          if (child.type != "include" && child.children && parentId) {
            child.children = child.children.map((id) =>
              [parentId, id].join(".")
            );
          }

          // Increase the offset of the fetched JSON element by the offset of the IncludeElement
          child.offset =
            parseInt(element.offset?.toString()) ||
            0 + parseInt(child.offset?.toString()) ||
            0;

          data[child.id] = child;
        }

        // From the fetched JSON data create a map of string keys to DesignElements
        const [newData, _newRoot] = (await formatData(data, root)) as [
          Map<string, DesignElement>,
          unknown
        ];

        // Merge together the new DesignElements with the previously collected elements
        for (const [key, value] of newData.entries()) {
          formattedElements.set(key, value);
        }
      } catch (e) {
        console.error(e);
        throw Error(
          `Failed to load include block "${element.id}". Check console for details.`
        );
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
  elements: Map<string, { offset: number | string }>
) => {
  // How many elements are there in hierachy (e.g. blk.sub_blk.reg => 3)
  const count = key.split(".").length + 1;

  // Add up the offset of every element along the current key's hierarchy
  let result = 0;
  for (let i = 1; i < count; i++) {
    const id = key.split(".").slice(0, i).join(".");
    const elem = elements.get(id);
    if (!elem) throw Error(`Could not find element ${id} (${i})`);

    if (elem.offset) {
      result += parseInt(elem.offset.toString());
    }
  }
  return result;
};
