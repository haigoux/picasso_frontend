import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/main.scss'
import App from './App.vue'
import router from './router'
import { API } from './api';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.globalProperties.$api = new API('http://localhost:8000'); // Replace with your actual base URL
app.mount('#app')
