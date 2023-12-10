import './style.css'

import { initRuntimes } from 'dash-compiler'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import { createApp } from 'vue'
import App from '@/App.vue'

// WARNING TO ANYONE READING THIS: I have lost so many hours of my life trying to figure out why this doesn't work
// when you using npm link to use a dev version of dash-compiler and then do npm run dev:force. It give a strange wasm error.
// The fix is to delete the .vite folder in node-modules, then do normal npm run dev. Then it works. I have no idea why.
initRuntimes(wasmUrl)

createApp(App).mount('#app')
