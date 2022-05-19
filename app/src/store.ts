import { reactive } from "vue";
import { MenuNode, Register, SharedState } from "./types";
import format from "./format";

export default {
  sharedState: reactive({
    data: null,
    fields: {},
    nodes: [],
  } as unknown as SharedState),

  loaded: false,

  load(filename: string) {
    return fetch(filename)
      .then((result) => result.json())
      .then((data) => {
        this.sharedState.data = data;
        this.sharedState.fields = this.get_field_map(data.elements);
        this.sharedState.nodes = this.get_nodes(data.elements, data.root);
        this.loaded = true;
      });
  },

  get_field_map(elements: { [key: string]: Register }) {
    const fields = new Map<string, string>();

    for (const id in elements) {
      const element = elements[id];
      if (element.fields) {
        for (const field of element.fields) {
          const field_id = id + "." + field.name;
          fields.set(field_id, id);
        }
      }
    }

    return fields;
  },

  get_nodes(elements: { [key: string]: Register }, element: Register) {
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
        node.children = this.get_nodes(elements, child);
      }

      return node;
    });
  },

  first_reg() {
    for (const key in this.sharedState.data.elements) {
      if (this.sharedState.data.elements[key].type == "reg") {
        return key;
      }
    }
  },
};
