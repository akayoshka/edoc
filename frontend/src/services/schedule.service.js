import api from './api'

class ScheduleService {
  // Получение всех расписаний
  async getAllSchedules() {
    const response = await api.get('/schedules')
    return response.data
  }

  // Получение расписания по ID
  async getSchedule(id) {
    const response = await api.get(`/schedules/${id}`)
    return response.data
  }

  // Поиск расписаний по врачу, дате или названию
  async searchSchedules(params = {}) {
    let url = '/schedules/search?'

    if (params.doctorId) {
      url += `doctorId=${params.doctorId}&`
    }

    if (params.date) {
      url += `date=${params.date}&`
    }

    if (params.title) {
      url += `title=${encodeURIComponent(params.title)}`
    }

    const response = await api.get(url)
    return response.data
  }
}

export default new ScheduleService()