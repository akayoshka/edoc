import api from './api'

class DoctorAppointmentService {
  // Получение всех записей на прием к текущему врачу
  async getMyAppointments() {
    const response = await api.get('/doctor/appointments')
    return response.data
  }

  // Получение записей на прием по дате
  async getAppointmentsByDate(date) {
    const response = await api.get(`/doctor/appointments/date/${date}`)
    return response.data
  }

  // Получение записи на прием по ID
  async getAppointment(id) {
    const response = await api.get(`/doctor/appointments/${id}`)
    return response.data
  }

  // Отмена записи на прием
  async cancelAppointment(id) {
    const response = await api.delete(`/doctor/appointments/${id}`)
    return response.data
  }
}

export default new DoctorAppointmentService()