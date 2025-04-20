import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Импорт Bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'

// Импорт SweetAlert2
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// Импорт Moment.js
import moment from 'moment'
import 'moment/locale/ru'

moment.locale('ru')

const app = createApp(App)

// Использование плагинов
app.use(store)
app.use(router)
app.use(VueSweetalert2)

// Глобальные свойства
app.config.globalProperties.$moment = moment

// Монтирование приложения
app.mount('#app')