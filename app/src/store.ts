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
    if (element.type == "include") {
      const response = await fetch(element.url);
      const json = (await response.json()) as RegisterDescriptionFile;

      const data = {} as { [key: string]: DesignElement };

      // Append the current id to the id names of the fetched JSON elements
      const reassignChildren = (parent: DesignElement | IncludeElement) => {
        if (parent.type != "include") {
          parent.id = [element.id, parent.id].join(".");

          // Make a recursive call to rename all the children elements
          parent.children?.forEach((child) => {
            const childElement = json.elements[child];
            if (!childElement)
              throw Error(`Could not find element in JSON ${child}`);

            reassignChildren(childElement);
          });

          // Reassign the keys in the children array
          parent.children = parent.children?.map((child) =>
            [element.id, child].join(".")
          );
          data[parent.id] = parent;
        }
      };
      // Call the reassign function on every root element
      json.root.children.forEach((child) => {
        const elem = json.elements[child];
        if (!elem) throw Error(`Could not find element in JSON ${child}`);
        reassignChildren(elem);
      });

      // Create a new DesignElement that is the parent of the fetched JSON elements
      const includeElement = {
        id: element.id,
        name: element.name,
        display_name: element.display_name,
        offset: element.offset,
        doc: element.doc,
        version: element.version,
        links: element.links,
        children: json.root.children.map((child) =>
          [element.id, child].join(".")
        ),
        type: "blk",
      } as DesignElement;
      formattedElements.set(includeElement.id, includeElement);

      // From the fetched JSON data create a map of string keys to DesignElements
      const [newData, _newRoot] = (await formatData(
        Object.values(Object.values(data)),
        root
      )) as [Map<string, DesignElement>, unknown];

      // Merge together the new DesignElements with the previously collected elements
      for (const [key, value] of newData.entries()) {
        formattedElements.set(key, value);
      }
    } else {
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
