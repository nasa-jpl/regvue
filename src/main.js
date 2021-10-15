import "primeflex/primeflex.css";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config'
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
// import TreeTable from 'primevue/treetable';
// import Column from 'primevue/column';

const app = createApp(App)

app.use(PrimeVue)

app.component('Splitter', Splitter);
app.component('SplitterPanel', SplitterPanel);

app.mount('#app')
