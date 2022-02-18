<template>
  <div v-if="reg">
    <RegLayout :reg="reg" :field_name="field_name"></RegLayout>
    <div id="doc"><span v-html='doc'></span></div>
    <RegFields :reg="reg" :field_name="field_name"></RegFields>
  </div>
</template>

<script>
import store from '@/store.js'

export default {
  data() {
    return {
      sharedState: store.sharedState,
    };
  },
  props: [
    'regid',
    'field_name',
  ],
  computed: {
    reg() {
      if (this.sharedState.data) {
        return this.sharedState.data.elements[this.regid]
      } else {
        return {}
      }
    },
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
