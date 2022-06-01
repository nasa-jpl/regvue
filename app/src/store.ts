import { reactive } from "vue";
import { MenuNode, Register, RegisterField, SharedState } from "./types";
import format from "./format";

export default {
  sharedState: reactive({
    data: null,
    fields: {},
    nodes: [],
  } as unknown as SharedState),

  loaded: false,

  async load(filename: string) {
    const result = await fetch(filename);
    const data = await result.json();

    for (const name in data.elements) {
      const element = data.elements[name];
      const fields = element.fields;
      fields?.forEach((field: RegisterField) => {
        if (field.reset) {
          field.value = field.reset;
        } else {
          field.value = 0;
        }
      });
    }

    this.sharedState.data = data;
    this.sharedState.fields = this.getFieldMap(data.elements);
    this.sharedState.nodes = this.getNodes(data.elements, data.root);
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
      if (element.fields) {
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

  getNodes(elements: { [key: string]: Register }, element: Register) {
    return element.children.map((child_id) => {
      const child = elements[child_id];

      const node = {
        key: child["id"],
        styleClass: child["id"],
        data: {
          name: child["name"],
          addr: format.hex(child["addr"]),
        },
      } as MenuNode;

      if ("children" in child) {
        node.children = this.getNodes(elements, child);
      }

      return node;
    });
  },

  getFirstRegister() {
    for (const key in this.sharedState.data.elements) {
      if (this.sharedState.data.elements[key].type == "reg") {
        return key;
      }
    }
  },
};
