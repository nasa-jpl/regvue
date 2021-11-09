import { reactive } from 'vue'

export default {
  sharedState: reactive({
    items: null
  }),

  loaded: false,

  load(filename) {
    return fetch(filename)
      .then(result => result.json())
      .then(json => {
        this.sharedState.items = json;
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
};
