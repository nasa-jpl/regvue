import { reactive } from "vue";
import {
  DesignRoot,
  DisplayType,
  MenuNode,
  Register,
  RegisterField,
  SharedState,
} from "src/types";
import format from "src/format";
import parse from "src/parse";

export default {
  sharedState: reactive({
    data: null,
    fields: {},
    nodes: [],
  } as unknown as SharedState),

  loaded: false,
  useByteSwap: false,
  selectedDisplayType: "hexadecimal" as DisplayType,
  path: "",

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

  async loadFile(file: string) {
    try {
      const data = await JSON.parse(file);
      await this.load(data);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  async load(data: SharedState["data"], path = "") {
    for (const name in data.elements) {
      const element = data.elements[name];
      if (!element) {
        throw Error(`Could not find element with id ${name}`);
      }
      const fields = element.fields;

      // Set the field.value to be a Bit[] that represents the field.reset or 0
      fields?.forEach((field: RegisterField) => {
        if (field.reset) {
          field.value = parse.stringToBitArray(
            field.reset.toString(),
            field.nbits
          );
        } else {
          field.value = parse.stringToBitArray("0", field.nbits);
        }
      });
    }

    this.sharedState.fields = this.getFieldMap(data.elements);
    this.sharedState.nodes = this.getNodes(data.elements, data.root);
    this.sharedState.data = data;
    this.path = path;
    this.loaded = true;
  },

  async untilLoaded() {
    const pollLoaded = (resolve: (value: boolean) => void) => {
      if (this.loaded) {
        resolve(true);
      } else {
        setTimeout(() => pollLoaded(resolve), 500);
      }
    };

    return new Promise(pollLoaded);
  },

  getFieldMap(elements: { [key: string]: Register }) {
    const fields = new Map<string, string>();

    for (const id in elements) {
      const element = elements[id];
      if (element?.fields) {
        for (const field of element.fields) {
          const field_id = id + "." + field.name;
          fields.set(field_id, id);
        }
        if (fields.has("reset")) {
          fields.set("value", fields.get("reset") as string);
        }
      }
    }

    return fields;
  },

  getNodes(
    elements: { [key: string]: Register },
    element: Register | DesignRoot
  ) {
    return element.children.map((child_id) => {
      const child = elements[child_id];
      if (!child) {
        throw Error(`Could not find element with id ${child_id}`);
      }

      const node = {
        key: child.id,
        styleClass: child.id,
        data: {
          name: child.name,
          addr: format.hex(child.addr || 0),
        },
      } as MenuNode;

      if (child.children) {
        node.children = this.getNodes(elements, child);
      }

      return node;
    });
  },

  getFirstRegister() {
    for (const key in this.sharedState.data.elements) {
      if (this.sharedState.data.elements[key]?.type == "reg") {
        return key;
      }
    }

    return "";
  },

  setSelectedDisplayType(value: DisplayType) {
    this.selectedDisplayType = value;
  },

  setUseByteSwap(value: boolean) {
    this.useByteSwap = value;
  },
};
