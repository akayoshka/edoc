import api from './api'

class DoctorService {
  // Получение всех врачей
  async getAllDoctors() {
    const response = await api.get('/doctors')
    return response.data
  }

  // Получение врача по ID
  async getDoctor(id) {
    const response = await api.get(`/doctors/${id}`)
    return response.data
  }

  // Поиск врачей по имени или специальности
  async searchDoctors(query = '', specialtyId = '') {
    let url = '/doctors/search?'

    if (query) {
      url += `query=${encodeURIComponent(query)}&`
    }

    if (specialtyId) {
      url += `specialtyId=${specialtyId}`
    }

    const response = await api.get(url)
    return response.data
  }
}

export default new DoctorService()