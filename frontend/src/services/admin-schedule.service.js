import api from './api'

class AdminScheduleService {
  // Получение всех расписаний
  async getAllSchedules() {
    const response = await api.get('/admin/schedules')
    return response.data
  }

  // Получение расписания по ID
  async getSchedule(id) {
    const response = await api.get(`/admin/schedules/${id}`)
    return response.data
  }

  // Создание нового расписания
  async createSchedule(scheduleData) {
    const response = await api.post('/admin/schedules', scheduleData)
    return response.data
  }

  // Обновление расписания
  async updateSchedule(id, scheduleData) {
    const response = await api.put(`/admin/schedules/${id}`, scheduleData)
    return response.data
  }

  // Удаление расписания
  async deleteSchedule(id) {
    const response = await api.delete(`/admin/schedules/${id}`)
    return response.data
  }
}

export default new AdminScheduleService()