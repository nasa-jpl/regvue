<template>
  <input type="text" placeholder="Search" @input="search($event.target.value)">
</template>

<script>
import store from '@/store.js'

export default {
  data() {
    return {
      sharedState: store.sharedState,
    }
  },
  emits: [
    "selectElement"
  ],
  methods: {
    search(text) {
      let fields = Array.from(this.sharedState.fields.keys())
      let matching_fields = fields.filter(field_id => {
        return field_id.toLowerCase().includes(text.toLowerCase())
      })
      if (matching_fields.length == 1) {
        let field_id = matching_fields[0]
        let element_id = this.sharedState.fields.get(field_id)

        this.$emit("selectElement", element_id)
      }
    }
  }
}
</script>


