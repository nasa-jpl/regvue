<template>
  <table id="reg-layout-table">
    <thead>
      <th class="layout_bit_index" v-for="bit in 32" :key="bit">{{ 32 - bit }}</th>
    </thead>
    <tbody>
      <tr>
        <td class="layout_field_name"
          :class="{ highlight: field_name == field.name }"
          v-responsive-rotate
          v-for="field in reg.fields" :key="field"
          :colspan="field.nbits">
          {{ field.name }}
        </td>
      </tr>
      <tr>
        <td class="layout_field_input"
          :class="{ highlight: field_name == field.name }"
          v-for="field in reg.fields" :key="field" :colspan="field.nbits">
          <input type="text" :value="field_value(field)"/>
        </td>
      </tr>
      <tr>
        <td colspan="32">
          <input type="text" @input="update_fields"/>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps([
  'reg',
  'field_name',
]);
</script>

<script>
export const canvas = document.createElement("canvas");
export const getTextWidth = function (text, font) {
  let context = canvas.getContext("2d");
  context.font = font;
  return context.measureText(text).width;
};
export const ResponsiveRotateDirective = {
  mounted: function (element) {
    const observer = new ResizeObserver(function (entries) {
      // We use one observer per element, therefore each observer
      // is observing only a single element.  Entries will always
      // contain a single entry.
      let entry = entries[0];
      let element_width = entry.contentRect.width;
      let element = entry.target;
      let text = element.textContent;
      let font = window.getComputedStyle(element).font;
      let text_width = getTextWidth(text, font);

      if (text_width > element_width) {
        element.classList.add("rotate");
      } else {
        element.classList.remove("rotate");
      }
    });

    observer.observe(element);
  }
}
function parse_int(s) {
  let {str, base} = parse_base(s.trim())
  return parseInt(str.replaceAll('_', ''), base)
}
function parse_base(s) {
  let lc = s.toLowerCase()

  if (lc.startsWith("0x")) {
    return {
      str: lc.slice(2),
      base: 16,
    }
  } else if (lc.startsWith("0b")) {
    return {
      str: lc.slice(2),
      base: 2,
    }
  } else {
    return {
      str: lc,
      base: 10,
    }
  }
}
export default {
  directives: {
    'responsive-rotate': ResponsiveRotateDirective,
  },
  data() {
    return {
    }
  },
  methods: {
    field_value(field) {
      let i = parseInt(field.reset);
      if (field.nbits == 1) {
        return i;
      } else {
        return "0x" + i.toString(16);
      }
    },
    update_fields(evt) {
      let value = parse_int(evt.target.value)

      for (const field of this.reg.fields) {
        let field_mask = (1 << field.nbits) - 1
        let field_value = (value >> field.lsb) & field_mask
        // TODO: make updates both ways: fields to reg, reg to fields
        // See https://stackoverflow.com/questions/60712430/make-two-inputs-update-each-other-in-two-way-binding
        // Also array of v-model https://stackoverflow.com/questions/34825065/vuejs-v-model-array-in-multiple-input
        // TODO: Update local field value storage instead
        //
        // 1. Create local field value variables
        // 2. On load/refresh (or whatever its called) initialize local field
        //    value variables with field reset values
        // 3. On input, update field local values with parsed input value
        field.reset = field_value
      }
    },
  },
  computed: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table {
    width: 100%;
    font-size: 12px;
    table-layout: fixed;
    vertical-align: top;
}
th {
    background-color: lightgray;
    text-align: center;
}

td, th {
    border: thin solid black;
    padding: 5px;
}

th:nth-of-type(8n), th:nth-of-type(8n-1), th:nth-of-type(8n-2), th:nth-of-type(8n-3) {
    background-color: gray;
}

.rotate {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
}

.layout_bit_index {
    width: 3.125%;
    text-align: center;
}

.layout_field_name {
    text-align: center;
    vertical-align: middle;
}

input[type="text"] {
    width: 100%;
    border: 0px;
    text-align: center;
    box-sizing: border-box;
}

.highlight {
  background-color: #fffbe5;
}

.highlight input {
  background-color: #fffbe5;
}
</style>
