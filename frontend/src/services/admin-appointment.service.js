import api from './api'

class AdminAppointmentService {
  // Получение всех записей на прием
  async getAllAppointments() {
    const response = await api.get('/admin/appointments')
    return response.data
  }

  // Получение записи на прием по ID
  async getAppointment(id) {
    const response = await api.get(`/admin/appointments/${id}`)
    return response.data
  }

  // Создание новой записи на прием
  async createAppointment(appointmentData) {
    const response = await api.post('/admin/appointments', appointmentData)
    return response.data
  }

  // Отмена записи на прием
  async cancelAppointment(id) {
    const response = await api.delete(`/admin/appointments/${id}`)
    return response.data
  }

  // Получение статистики записей на прием
  async getAppointmentStats() {
    const response = await api.get('/admin/appointments/stats')
    return response.data
  }
}

export default new AdminAppointmentService()