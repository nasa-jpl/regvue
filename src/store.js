import { reactive } from 'vue'

export default {
  sharedState: reactive({
    data: null,
    fields: null,
    nodes: null,
  }),

  loaded: false,

  load(filename) {
    return fetch(filename)
      .then(result => result.json())
      .then(data => {
        this.sharedState.data = data;
        this.sharedState.fields = this.get_field_map(data.elements)
        this.sharedState.nodes = this.get_nodes(data.elements, data.root)
        this.loaded = true;
      });
  },

  untilLoaded(store) {
    function pollLoaded(resolve) {
      if (store.loaded) {
        resolve();
      } else {
        setTimeout(_ => pollLoaded(resolve), 1000);
      }
    }

    return new Promise(pollLoaded);
  },

  get_field_map(elements) {
    let fields = new Map()

    for (let id in elements) {
      let element = elements[id]
      if (element.fields) {
        for (let field of element.fields) {
          let field_id = id + "." + field.name
          fields.set(field_id, id)
        }
      }
    }

    return fields
  },

  get_nodes(elements, element) {
    return element.children.map(child_id => {
      let child = elements[child_id];

      let node = {
        key: child["id"],
        styleClass: child["id"],
        data: {
          name: child["name"],
          addr: child["addr"],
        }
      };

      if ("children" in child) {
        node["children"] = this.get_nodes(elements, child);
      }

      return node;
    });
  },

  first_reg() {
    for (let key in this.sharedState.data.elements) {
      if (this.sharedState.data.elements[key].type == "reg") {
        return key;
      }
    }
  },
};
