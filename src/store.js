import { reactive } from 'vue'

export default {
  sharedState: reactive({
    items: null,
    fields: null,
    nodes: null,
  }),

  loaded: false,

  load(filename) {
    return fetch(filename)
      .then(result => result.json())
      .then(items => {
        this.sharedState.items = items;
        this.sharedState.fields = this.get_field_map(items)
        this.sharedState.nodes = this.get_nodes(items, items["root"])
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

  get_field_map(items) {
    let fields = new Map()

    for (let id in items) {
      let item = items[id]
      if (item.fields) {
        for (let field of item.fields) {
          let field_id = id + "." + field.name
          fields.set(field_id, id)
        }
      }
    }

    return fields
  },

  get_nodes(items, item) {
    return item.children.map(child_id => {
      let child = items[child_id];

      let node = {
        key: child["id"],
        styleClass: child["id"],
        data: {
          name: child["name"],
          addr: child["addr"],
        }
      };

      if ("children" in child) {
        node["children"] = this.get_nodes(items, child);
      }

      return node;
    });
  },

  first_reg() {
    for (let key in this.sharedState.items) {
      if (this.sharedState.items[key].type == "reg") {
        return key;
      }
    }
  },
};
