import api from './api'

class AuthService {
  // Универсальный вход
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password
    })
    return response.data
  }

  // Регистрация пациента
  async registerPatient(userData) {
    const response = await api.post('/auth/register/patient', userData)
    return response.data
  }

  // Получение информации о текущем пользователе
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  }
}

export default new AuthService()