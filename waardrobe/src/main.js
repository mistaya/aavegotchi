import { createApp } from 'vue'
import VueAnimXyz from '@animxyz/vue3'
import '@animxyz/core' // Import css here if you haven't elsewhere
import App from './App.vue'
import router from './router'

const app = createApp(App).use(router)
app.use(VueAnimXyz)

app.mount('#app')
