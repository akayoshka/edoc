import api from './api'

class DoctorScheduleService {
  // Получение всех расписаний текущего врача
  async getMySchedules() {
    const response = await api.get('/doctor/schedules')
    return response.data
  }

  // Получение расписания по ID
  async getSchedule(id) {
    const response = await api.get(`/doctor/schedules/${id}`)
    return response.data
  }

  // Создание нового расписания
  async createSchedule(scheduleData) {
    const response = await api.post('/doctor/schedules', scheduleData)
    return response.data
  }

  // Обновление расписания
  async updateSchedule(id, scheduleData) {
    const response = await api.put(`/doctor/schedules/${id}`, scheduleData)
    return response.data
  }

  // Удаление расписания
  async deleteSchedule(id) {
    const response = await api.delete(`/doctor/schedules/${id}`)
    return response.data
  }
}

export default new DoctorScheduleService()