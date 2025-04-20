import api from './api'

class DoctorProfileService {
  // Получение профиля текущего врача
  async getProfile() {
    const response = await api.get('/doctor/profile')
    return response.data
  }

  // Обновление профиля
  async updateProfile(profileData) {
    const response = await api.put('/doctor/profile', profileData)
    return response.data
  }

  // Изменение пароля
  async changePassword(passwordData) {
    const response = await api.post('/doctor/profile/change-password', passwordData)
    return response.data
  }
}

export default new DoctorProfileService()