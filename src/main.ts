import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'

const savedFont = localStorage.getItem('app-font') || 'Inter'
if (savedFont === 'System') {
  document.body.style.fontFamily = 'system-ui, sans-serif'
} else {
  document.body.style.fontFamily = `"${savedFont}", sans-serif`
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
