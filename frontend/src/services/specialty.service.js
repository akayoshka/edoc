import api from './api'

class SpecialtyService {
  // Получение всех специальностей
  async getAllSpecialties() {
    const response = await api.get('/specialties')
    return response.data
  }

  // Получение специальности по ID
  async getSpecialty(id) {
    const response = await api.get(`/specialties/${id}`)
    return response.data
  }
}

export default new SpecialtyService()