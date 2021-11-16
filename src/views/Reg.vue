<template>
  <div v-if="reg">
    <RegLayout :reg="reg"></RegLayout>
    <div id="doc"><span v-html='doc'></span></div>
    <RegFields :reg="reg"></RegFields>
  </div>
</template>

<script>
import store from '@/store.js'

export default {
  data() {
    return {
      sharedState: store.sharedState,
      reg: null
    };
  },
  props: [
    'regid',
  ],
  beforeRouteEnter(_to, _from, next) {
    next(vm => {
        store.untilLoaded(store)
          .then(() => {
            vm.reg = vm.sharedState.items[vm.regid];
          })
    });
  },
  beforeRouteUpdate(_to, _from) {
    this.reg = this.sharedState.items[this.regid];
  },
  computed: {
    doc() {
      // The doc key may not be present
      if (this.reg.doc) {
        return this.reg.doc.replaceAll("\n", "<br>");
      } else {
        return "";
      }
    }
  }
}
</script>

<style scoped>
#doc {
  text-align: left;
}
</style>
