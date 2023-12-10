import './style.css'

import { initRuntimes } from 'dash-compiler'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import { createApp } from 'vue'
import App from '@/App.vue'

initRuntimes(wasmUrl)

createApp(App).mount('#app')
