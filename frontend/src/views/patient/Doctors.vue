<template>
  <div class="doctors-page">
    <h1>Список врачей</h1>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Поиск врачей</h5>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="search" class="form-label">Поиск по имени</label>
            <input
              type="text"
              class="form-control"
              id="search"
              v-model="searchQuery"
              placeholder="Введите имя врача"
              @input="searchDoctors"
            >
          </div>
          <div class="col-md-6 mb-3">
            <label for="specialty" class="form-label">Специальность</label>
            <select
              class="form-select"
              id="specialty"
              v-model="selectedSpecialty"
              @change="searchDoctors"
            >
              <option value="">Все специальности</option>
              <option
                v-for="specialty in specialties"
                :key="specialty.id"
                :value="specialty.id"
              >
                {{ specialty.sname }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Список врачей -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка врачей...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="doctors.length === 0" class="alert alert-info">
      Врачи не найдены. Попробуйте изменить параметры поиска.
    </div>

    <div v-else class="row">
      <div
        v-for="doctor in doctors"
        :key="doctor.docid"
        class="col-md-6 col-lg-4 mb-4"
      >
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ doctor.docname }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">{{ doctor.specialty_name }}</h6>
            <p class="card-text">
              <strong>Email:</strong> {{ doctor.docemail }}<br>
              <strong>Телефон:</strong> {{ doctor.doctel || 'Не указан' }}
            </p>
          </div>
          <div class="card-footer bg-white">
            <router-link
              :to="`/patient/doctors/${doctor.docid}`"
              class="btn btn-primary"
            >
              Подробнее
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DoctorService from '@/services/doctor.service'
import SpecialtyService from '@/services/specialty.service'

export default {
  name: 'PatientDoctors',
  data() {
    return {
      doctors: [],
      specialties: [],
      searchQuery: '',
      selectedSpecialty: '',
      loading: false,
      error: null
    }
  },
  created() {
    this.fetchSpecialties()
    this.searchDoctors()
  },
  methods: {
    // Получение списка специальностей
    async fetchSpecialties() {
      try {
        const response = await SpecialtyService.getAllSpecialties()
        if (response.status === 'success') {
          this.specialties = response.data.specialties
        }
      } catch (error) {
        console.error('Ошибка при получении специальностей:', error)
      }
    },

    // Поиск врачей
    async searchDoctors() {
      this.loading = true
      this.error = null

      try {
        const response = await DoctorService.searchDoctors(
          this.searchQuery,
          this.selectedSpecialty
        )

        if (response.status === 'success') {
          this.doctors = response.data.doctors
        } else {
          this.error = response.message || 'Ошибка при получении врачей'
        }
      } catch (error) {
        console.error('Ошибка при поиске врачей:', error)
        this.error = 'Не удалось загрузить список врачей. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>