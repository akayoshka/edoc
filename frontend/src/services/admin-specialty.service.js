import api from './api'

class AdminSpecialtyService {
  // Получение всех специальностей
  async getAllSpecialties() {
    const response = await api.get('/admin/specialties')
    return response.data
  }

  // Создание новой специальности
  async createSpecialty(name) {
    const response = await api.post('/admin/specialties', { name })
    return response.data
  }

  // Обновление специальности
  async updateSpecialty(id, name) {
    const response = await api.put(`/admin/specialties/${id}`, { name })
    return response.data
  }

  // Удаление специальности
  async deleteSpecialty(id) {
    const response = await api.delete(`/admin/specialties/${id}`)
    return response.data
  }
}

export default new AdminSpecialtyService()