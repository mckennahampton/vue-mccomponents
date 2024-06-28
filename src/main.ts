import { createApp } from 'vue'
import '../lib/index.css'
import App from './App.vue'

// Font awesome stuff
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

// Import the font awesome icons to the local library
library.add(fas)
library.add(fab)
library.add(far)

createApp(App).mount('#app')