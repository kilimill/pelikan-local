import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/main.scss'
import 'bootstrap'
import "./assets/material-icons.scss"

createApp(App).use(store).use(router).mount('#app')
