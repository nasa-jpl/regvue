<template>
  <span></span>
</template>

<script>
import store from '@/store.js'

export default {
  data() {
    return {}
  },
  created() {
    store.untilLoaded(store)
      .then(_ => {
        this.$router.push({ name: "reg", params: { regid: store.first_reg() } })
      })
  },
}
</script>
