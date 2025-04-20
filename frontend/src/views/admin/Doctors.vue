<template>
  <div class="doctors-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Управление врачами</h1>
      <router-link to="/admin/doctors/create" class="btn btn-primary">
        Добавить нового врача
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="search" class="form-label">Поиск по имени</label>
            <input
              type="text"
              class="form-control"
              id="search"
              v-model="searchQuery"
              placeholder="Введите имя врача"
              @input="filterDoctors"
            >
          </div>
          <div class="col-md-6 mb-3">
            <label for="specialty-filter" class="form-label">Специальность</label>
            <select
              class="form-select"
              id="specialty-filter"
              v-model="specialtyFilter"
              @change="filterDoctors"
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
      <p class="mt-2">Загрузка списка врачей...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="filteredDoctors.length === 0" class="alert alert-info">
      Врачи не найдены.
      <span v-if="searchQuery || specialtyFilter">
        Попробуйте изменить параметры поиска.
      </span>
      <span v-else>
        <router-link to="/admin/doctors/create">Добавить нового врача</router-link>
      </span>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Специальность</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doctor in filteredDoctors" :key="doctor.docid">
            <td>{{ doctor.docid }}</td>
            <td>{{ doctor.docname }}</td>
            <td>{{ doctor.docemail }}</td>
            <td>{{ doctor.doctel || 'Не указан' }}</td>
            <td>{{ doctor.specialty_name }}</td>
            <td>
              <div class="btn-group">
                <router-link
                  :to="`/admin/doctors/${doctor.docid}`"
                  class="btn btn-sm btn-info"
                  title="Просмотр"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
                <router-link
                  :to="`/admin/doctors/${doctor.docid}/edit`"
                  class="btn btn-sm btn-primary"
                  title="Редактировать"
                >
                  <i class="bi bi-pencil"></i>
                </router-link>
                <button
                  class="btn btn-sm btn-danger"
                  title="Удалить"
                  @click="confirmDeleteDoctor(doctor)"
                  :disabled="deleteInProgress"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import AdminDoctorService from '@/services/admin-doctor.service'
import SpecialtyService from '@/services/specialty.service'

export default {
  name: 'AdminDoctors',
  data() {
    return {
      doctors: [],
      specialties: [],
      searchQuery: '',
      specialtyFilter: '',
      loading: false,
      error: null,
      deleteInProgress: false
    }
  },
  computed: {
    // Отфильтрованный список врачей
    filteredDoctors() {
      if (!this.searchQuery && !this.specialtyFilter) {
        return this.doctors
      }

      return this.doctors.filter(doctor => {
        const matchesSearch = !this.searchQuery ||
          doctor.docname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          doctor.docemail.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesSpecialty = !this.specialtyFilter ||
          doctor.specialties == this.specialtyFilter;

        return matchesSearch && matchesSpecialty;
      })
    }
  },
  created() {
    this.fetchDoctors()
    this.fetchSpecialties()
  },
  methods: {
    // Получение списка врачей
    async fetchDoctors() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminDoctorService.getAllDoctors()

        if (response.status === 'success') {
          this.doctors = response.data.doctors
        } else {
          this.error = response.message || 'Ошибка при получении врачей'
        }
      } catch (error) {
        console.error('Ошибка при получении врачей:', error)
        this.error = 'Не удалось загрузить список врачей. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

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

    // Фильтрация врачей (не нужна в этой реализации, так как используется computed property)
    filterDoctors() {
      // Фильтрация происходит автоматически через вычисляемые свойства
    },

    // Подтверждение удаления врача
    confirmDeleteDoctor(doctor) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить врача ${doctor.docname}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteDoctor(doctor.docid)
        }
      })
    },

    // Удаление врача
    async deleteDoctor(id) {
      this.deleteInProgress = true

      try {
        const response = await AdminDoctorService.deleteDoctor(id)

        if (response.status === 'success') {
          // Показываем уведомление об успешном удалении
          this.$swal({
            title: 'Удалено!',
            text: 'Врач успешно удален',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список врачей
          this.fetchDoctors()
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось удалить врача',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при удалении врача:', error)
        let errorMessage = 'Не удалось удалить врача. Пожалуйста, попробуйте позже.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        })
      } finally {
        this.deleteInProgress = false
      }
    }
  }
}
</script>

<style scoped>
/* Импорт Bootstrap Icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");
</style>