import { createApp } from 'vue'
import App from './App.vue'

import { initQuasar } from './quasar'

const app = createApp(App)

initQuasar(app);

app.mount("#app")
