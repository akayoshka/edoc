import axios from 'axios'
import store from '../store'
import router from '../router'

// Создаем экземпляр axios с базовым URL для API
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Перехватчик запросов для добавления токена
api.interceptors.request.use(config => {
  const token = store.getters.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Перехватчик ответов для обработки ошибок аутентификации
api.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response) {
    const { status } = error.response

    // Если сервер вернул 401 (Unauthorized), выходим из системы
    if (status === 401) {
      store.dispatch('logout')
      router.push('/login')
    }

    // Если сервер вернул 403 (Forbidden), перенаправляем на домашнюю страницу
    if (status === 403) {
      router.push('/')
    }
  }

  return Promise.reject(error)
})

export default api