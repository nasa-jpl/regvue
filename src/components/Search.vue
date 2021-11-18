<template>
  <div class="search-box">
    <input
      type="text"
      placeholder="Search"
      :value="query"
      autocomplete="off"
      spellcheck="false"
      @input="query = $event.target.value"
      @focus="focused = true"
      @keyup.enter="go(focusIndex)"
    >
    <div
      v-if="showSuggestions"
      class="suggestions"
      @mouseleave="unfocus"
    >
      <section v-if="suggestions.regs.length > 0" >
        <div class="suggestion-section-heading">Registers</div>
        <ul>
          <li
            v-for="(s, i) in suggestions.regs"
            :key="i"
            class="suggestion"
            :class="{ focused: i === focusIndex }"
            @mousedown="go(i)"
            @mouseenter="focus(i)"
          >
            <a
              :href="this.$router.resolve(s.path).href"
              @click.prevent
            >
              <span class="page-title">{{ s.name }}</span>
            </a>
          </li>
        </ul>
      </section>
      <section v-if="suggestions.fields.length > 0">
        <div class="suggestion-section-heading">Fields</div>
        <ul>
          <li
            v-for="(s, i) in suggestions.fields"
            :key="i + suggestions.regs.length"
            class="suggestion"
            :class="{ focused: i + suggestions.regs.length === focusIndex }"
            @mousedown="go(i + suggestions.regs.length)"
            @mouseenter="focus(i + suggestions.regs.length)"
          >
            <a
              :href="this.$router.resolve(s.path).href"
              @click.prevent
            >
              <span class="page-title">{{ s.name }}</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
import store from '@/store.js'

export default {
  data() {
    return {
      sharedState: store.sharedState,
      query: '',
      focused: false,
      focusIndex: 0,
    }
  },
  methods: {
    go(i) {
      if (!this.showSuggestions) { return }

      let path = this.suggestions.all[i].path
      this.$router.push(path)
      this.query = ''
      this.focusIndex = 0
    },
    focus(i) {
      this.focusIndex = i
    },
    unfocus() {
      this.focusIndex = -1
    }
  },
  computed: {
    showSuggestions() {
      return (
        this.focused
        && this.suggestions
        && this.suggestions.all.length
      )
    },
    suggestions() {
      const query = this.query.trim().toLowerCase()
      if (!query) { return }

      const res = {
        regs: [],
        fields: [],
        all: [],
      }

      // Registers
      for (let id in this.sharedState.data.elements) {
        let item = this.sharedState.data.elements[id]

        if (item.type == "reg") {
          if (item.name.toLowerCase().includes(query)) {
            let path = { name: "reg", params: { regid: id } }
            let suggestion = {
              type: "Register",
              name: id,
              path: path,
            }
            res.regs.push(suggestion)
            res.all.push(suggestion)
          }
        }
      }

      // Fields
      for (let [field_id, element_id] of this.sharedState.fields) {
        let field_name = field_id.replace(/.*\./, '')
        if (field_name.toLowerCase().includes(query)) {
          let path = { name: "field", params: { regid: element_id, field_name: field_name } }
          let suggestion = {
            type: "Field",
            name: field_id,
            path: path,
          }
          res.fields.push(suggestion)
          res.all.push(suggestion)
        }
      }

      return res
    },
  }
}
</script>

<style>
.search-box {
  display: inline-block;
  position: relative;
  margin-right: 1rem;
}
.search-box input {
  cursor: text;
  width: 10rem;
  height: 2rem;
  color: #404040;
  display: inline-block;
  border: 1px solid #000;
  border-radius: 2rem;
  font-size: 0.9rem;
  line-height: 2rem;
  /* padding: 0 0.5rem 0 2rem; */
  outline: none;
  transition: all 0.2s ease;
  /* background: #fff url("search.svg") 0.6rem 0.5rem no-repeat; */
  background-size: 1rem;
  text-align: center;
}
.search-box input:focus {
  cursor: auto;
  border-color: #008000;
}
.search-box .suggestions {
  background: #fff;
  width: 30rem;
  position: absolute;
  top: 2rem;
  border: 1px solid #000;
  border-radius: 6px;
  padding: 0.4rem;
  list-style-type: none;
  text-align: left;
}
.suggestions section ul {
  list-style-type: none;
}
.suggestion-section-heading {
  background-color: #336799;
  color: white;
}

.search-box .suggestions.align-right {
  right: 0;
}
.search-box .suggestion {
  line-height: 1.4;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}
.search-box .suggestion a {
  white-space: normal;
  color: #595959;
}
.search-box .suggestion a .page-title {
  font-weight: 600;
}
.search-box .suggestion a .header {
  font-size: 0.9em;
  margin-left: 0.25em;
}
.search-box .suggestion.focused {
  background-color: #f3f4f5;
}
.search-box .suggestion.focused a {
  color: #008000;
}
</style>
