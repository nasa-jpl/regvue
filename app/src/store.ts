import { defineStore } from "pinia";
import {
  DesignElement,
  DesignRoot,
  DisplayType,
  Field,
  IncludeElement,
  RegisterDescriptionFile,
} from "src/types";
import parse from "src/parse";

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
        const result = await fetch(url);
        const data = await result.json();
        await this.load(data, url);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },

    // Try load the store by parsing the provided JSON string
    // Return true on successful load and false if load fails
    async loadFile(jsonString: string) {
      try {
        const data = await JSON.parse(jsonString);
        await this.load(data);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },

    // Parse JSON data and populate the store variables
    async load(data: RegisterDescriptionFile, url = "") {
      const [elements, root] = (await formatData(
        Object.values(data.elements),
        data.root
      )) as [Map<string, DesignElement>, DesignRoot];

      if (!elements) throw Error("Error formating data");
      if (!root) throw Error("Error updating DesignRoot");

      for (const [_, element] of elements.entries()) {
        // Calculate the address from an element's offset and its parents' offsets
        element.addr = getAddress(element.id, elements);
      }

      this.elements = elements;
      this.root = root;
      this.url = url;
      this.loaded = true;
    },
  },
});

const formatData = async (
  elements: (DesignElement | IncludeElement)[],
  root: DesignRoot
) => {
  let formattedElements = new Map<string, DesignElement>();

  for (const element of Object.values(elements)) {
    // If the element is an IncludeElement fetch and format from its url
    if (element.type == "include") {
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
          ...json.root.children.map((childId) => [parentId, childId].join(".")),
          ...root.children.slice(idx + 1),
        ];
      }

      // Replace any reference to the include block with the json data it references for previous
      // formattedElement values
      for (const [_, formattedElement] of formattedElements.entries()) {
        const idx = formattedElement.children?.indexOf(element.id);
        if (idx >= 0) {
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
        child.id = [parentId, child.id].join(".");

        // Append the parentId to each child of the fetched JSON element
        if (child.type != "include" && child.children) {
          child.children = child.children.map((id) => [parentId, id].join("."));
        }

        // Increase the offset of the fetched JSON element by the offset of the IncludeElement
        child.offset =
          parseInt(element.offset?.toString()) ||
          0 + parseInt(child.offset?.toString()) ||
          0;

        data[child.id] = child;
      }

      // From the fetched JSON data create a map of string keys to DesignElements
      const [newData, _newRoot] = (await formatData(
        Object.values(Object.values(data)),
        root
      )) as [Map<string, DesignElement>, unknown];

      // Merge together the new DesignElements with the previously collected elements
      for (const [key, value] of newData.entries()) {
        formattedElements.set(key, value);
      }
    }

    // If the element is not an IncludeElement, format its fields and add to formattedElements map
    else {
      const fields = element.fields;

      // Set the field.value to be a Bit[] that represents the field.reset or 0
      fields?.forEach((field: Field) => {
        if (field.reset) {
          field.value = parse.stringToBitArray(
            field.reset.toString(),
            field.nbits
          );
        } else {
          field.value = parse.stringToBitArray("0", field.nbits);
        }
      });
      formattedElements.set(element.id, element);
    }
  }

  return [formattedElements, root];
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
