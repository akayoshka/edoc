import api from './api'

class PatientService {
  // Получение профиля текущего пациента
  async getProfile() {
    const response = await api.get('/patient/profile')
    return response.data
  }

  // Обновление профиля
  async updateProfile(profileData) {
    const response = await api.put('/patient/profile', profileData)
    return response.data
  }

  // Изменение пароля
  async changePassword(passwordData) {
    const response = await api.post('/patient/profile/change-password', passwordData)
    return response.data
  }
}

export default new PatientService()