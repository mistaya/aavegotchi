import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import SiteIcon from './components/SiteIcon.vue'

const app = createApp(App)
app.use(router)
app.component('SiteIcon', SiteIcon)
app.mount('#app')
