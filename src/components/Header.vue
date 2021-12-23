<template>
  <header class="p-3 mb-3 border-bottom">
    <div class="container">
      <nav class="navbar fixed-top navbar-light bg-light py-0">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 ml-2 h1">{{ title }}</span>

          <form class="col-3 mb-3 mb-lg-0 mx-auto">
            <Search/>
          </form>

          <ul class="nav mb-2 justify-content-center mb-md-0">
            <li v-for="link in links" :key="link"><a :href="link.href" class="nav-link px-2 link-secondary">{{ link.text }}</a></li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: [
    'title',
    'links',
  ],
}
</script>

<style>
nav {
  box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 5%), inset 0 -1px 0 rgb(0 0 0 / 15%);
}
</style>
