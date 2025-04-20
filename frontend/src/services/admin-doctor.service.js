import api from './api'

class AdminDoctorService {
  // Получение всех врачей
  async getAllDoctors() {
    const response = await api.get('/admin/doctors')
    return response.data
  }

  // Получение врача по ID
  async getDoctor(id) {
    const response = await api.get(`/admin/doctors/${id}`)
    return response.data
  }

  // Создание нового врача
  async createDoctor(doctorData) {
    const response = await api.post('/admin/doctors', doctorData)
    return response.data
  }

  // Обновление врача
  async updateDoctor(id, doctorData) {
    const response = await api.put(`/admin/doctors/${id}`, doctorData)
    return response.data
  }

  // Сброс пароля врача
  async resetDoctorPassword(id, newPassword) {
    const response = await api.post(`/admin/doctors/${id}/reset-password`, { newPassword })
    return response.data
  }

  // Удаление врача
  async deleteDoctor(id) {
    const response = await api.delete(`/admin/doctors/${id}`)
    return response.data
  }
}

export default new AdminDoctorService()