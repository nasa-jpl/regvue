import "primeflex/primeflex.css";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import devtools from '@vue/devtools'
import { createApp } from 'vue'
import App from './App.vue'

import Reg from '@/components/Reg.vue'
import RegLayout from '@/components/RegLayout.vue'
import RegFields from '@/components/RegFields.vue'

import PrimeVue from 'primevue/config';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

if (process.env.NODE_ENV === 'development') {
  devtools.connect()
}

createApp(App)
  .use(PrimeVue)
  .component('Reg', Reg)
  .component('RegLayout', RegLayout)
  .component('RegFields', RegFields)
  .component('Splitter', Splitter)
  .component('SplitterPanel', SplitterPanel)
  .component('TreeTable', TreeTable)
  .component('Column', Column)
  .mount('#app');
