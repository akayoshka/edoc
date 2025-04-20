import api from './api'

class AdminPatientService {
  // Получение всех пациентов
  async getAllPatients() {
    const response = await api.get('/admin/patients')
    return response.data
  }

  // Получение пациента по ID
  async getPatient(id) {
    const response = await api.get(`/admin/patients/${id}`)
    return response.data
  }

  // Создание нового пациента
  async createPatient(patientData) {
    const response = await api.post('/admin/patients', patientData)
    return response.data
  }

  // Обновление пациента
  async updatePatient(id, patientData) {
    const response = await api.put(`/admin/patients/${id}`, patientData)
    return response.data
  }

  // Сброс пароля пациента
  async resetPatientPassword(id, newPassword) {
    const response = await api.post(`/admin/patients/${id}/reset-password`, { newPassword })
    return response.data
  }

  // Удаление пациента
  async deletePatient(id) {
    const response = await api.delete(`/admin/patients/${id}`)
    return response.data
  }
}

export default new AdminPatientService()