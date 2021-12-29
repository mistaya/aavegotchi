import { createApp } from 'vue'
import VueAnimXyz from '@animxyz/vue3'
import '@animxyz/core' // Import css here if you haven't elsewhere
import App from './App.vue'

import detectEthereumProvider from '@metamask/detect-provider';
import router from './router'
detectEthereumProvider().then(() => {
    // from now on, the provider should be available at window.ethereum

    const app = createApp(App).use(router)
    app.use(VueAnimXyz)

    app.mount('#app')
}).catch(err => {
    console.error("Error detecting provider", err);
});
