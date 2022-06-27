import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import SiteIcon from '@/site/SiteIcon.vue'
import SiteButton from '@/site/SiteButton.vue'

const app = createApp(App)
app.use(router)
app.component('SiteIcon', SiteIcon)
app.component('SiteButton', SiteButton)
app.mount('#app')
