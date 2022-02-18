<template>
  <header class="p-3 mb-3 border-bottom">
    <div class="container">
      <nav class="navbar fixed-top navbar-light bg-light py-0">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 ml-2 h1" @click="showVersion">{{ title }}</span>
          <div class="modal" id="version-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Version</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  {{ version }}
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>

          <form class="col-3 mb-3 mb-lg-0 mx-auto">
            <Search/>
          </form>

          <ul v-if="links" class="nav mb-2 justify-content-center mb-md-0">
            <li v-for="link in links" :key="link"><a :href="link.href" class="nav-link px-2 link-secondary">{{ link.text }}</a></li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
import { Modal } from "bootstrap"

export default {
  data() {
    return {}
  },
  props: [
    'title',
    'links',
    'version',
  ],
  methods: {
    showVersion() {
      let modal = document.getElementById("version-modal")
      document.body.appendChild(modal)
      let bsModal = new Modal(modal, {})
      bsModal.show()
    }
  },
}
</script>

<style>
nav {
  box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 5%), inset 0 -1px 0 rgb(0 0 0 / 15%);
}
</style>
