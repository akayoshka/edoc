import api from './api'

class AdminStatsService {
  // Получение общей статистики системы
  async getSystemStats() {
    const response = await api.get('/admin/stats')
    return response.data
  }
}

export default new AdminStatsService()