import { reactive } from 'vue'

export default {
  sharedState: reactive({
    items: null,
    fields: null,
  }),

  loaded: false,

  load(filename) {
    return fetch(filename)
      .then(result => result.json())
      .then(json => {
        this.sharedState.items = json;
        this.sharedState.fields = this.get_field_map(json)
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
};
