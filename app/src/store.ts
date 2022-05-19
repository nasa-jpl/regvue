import { reactive } from "vue";
import format from "./format";

export interface Register {
  display_name: string;
  version: string;
  links: Map<string, string>;
  children: Array<string>;
  id: string;
  doc: string;
  type: string;
  name: string;
  addr: number;
  offset: number;
}

// TODO define nodes and fields interfaces
export interface SharedState {
  data: {
    root: {
      display_name: string;
      links: Map<string, string>;
      version: string;
    };
    elements: {
      [key: string]: Register;
    };
  };
  fields: {
    [key: string]: any;
  };
  nodes: Array<Object>;
}

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

  untilLoaded(store) {
    function pollLoaded(resolve) {
      if (store.loaded) {
        resolve();
      } else {
        setTimeout(() => pollLoaded(resolve), 1000);
      }
    }

    return new Promise(pollLoaded);
  },

  get_field_map(elements) {
    const fields = new Map();

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

  get_nodes(elements, element) {
    return element.children.map((child_id) => {
      const child = elements[child_id];

      const node = {
        key: child["id"],
        styleClass: child["id"],
        data: {
          name: child["name"],
          addr: format.hex(child["addr"]),
        },
      };

      if ("children" in child) {
        node["children"] = this.get_nodes(elements, child);
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
