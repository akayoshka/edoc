import api from './api'

class AppointmentService {
  // Получение всех записей текущего пациента
  async getMyAppointments() {
    const response = await api.get('/appointments/my')
    return response.data
  }

  // Получение записи по ID
  async getAppointment(id) {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  }

  // Создание новой записи
  async createAppointment(scheduleId) {
    const response = await api.post('/appointments', { scheduleId })
    return response.data
  }

  // Отмена записи
  async cancelAppointment(id) {
    const response = await api.delete(`/appointments/${id}`)
    return response.data
  }
}

export default new AppointmentService()