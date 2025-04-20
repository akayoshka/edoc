<template>
  <div class="patients-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Управление пациентами</h1>
      <router-link to="/admin/patients/create" class="btn btn-primary">
        Добавить нового пациента
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="search" class="form-label">Поиск</label>
            <input
              type="text"
              class="form-control"
              id="search"
              v-model="searchQuery"
              placeholder="Поиск по имени или email"
              @input="filterPatients"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Список пациентов -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка списка пациентов...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="filteredPatients.length === 0" class="alert alert-info">
      Пациенты не найдены.
      <span v-if="searchQuery">
        Попробуйте изменить параметры поиска.
      </span>
      <span v-else>
        <router-link to="/admin/patients/create">Добавить нового пациента</router-link>
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
            <th>Дата рождения</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in filteredPatients" :key="patient.pid">
            <td>{{ patient.pid }}</td>
            <td>{{ patient.pname }}</td>
            <td>{{ patient.pemail }}</td>
            <td>{{ patient.ptel || 'Не указан' }}</td>
            <td>{{ formatDate(patient.pdob) }}</td>
            <td>
              <div class="btn-group">
                <router-link
                  :to="`/admin/patients/${patient.pid}`"
                  class="btn btn-sm btn-info"
                  title="Просмотр"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
                <router-link
                  :to="`/admin/patients/${patient.pid}/edit`"
                  class="btn btn-sm btn-primary"
                  title="Редактировать"
                >
                  <i class="bi bi-pencil"></i>
                </router-link>
                <button
                  class="btn btn-sm btn-danger"
                  title="Удалить"
                  @click="confirmDeletePatient(patient)"
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
import AdminPatientService from '@/services/admin-patient.service'

export default {
  name: 'AdminPatients',
  data() {
    return {
      patients: [],
      searchQuery: '',
      loading: false,
      error: null,
      deleteInProgress: false
    }
  },
  computed: {
    // Отфильтрованный список пациентов
    filteredPatients() {
      if (!this.searchQuery) {
        return this.patients
      }

      const query = this.searchQuery.toLowerCase()
      return this.patients.filter(patient => {
        return patient.pname.toLowerCase().includes(query) ||
               patient.pemail.toLowerCase().includes(query)
      })
    }
  },
  created() {
    this.fetchPatients()
  },
  methods: {
    // Получение списка пациентов
    async fetchPatients() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminPatientService.getAllPatients()

        if (response.status === 'success') {
          this.patients = response.data.patients
        } else {
          this.error = response.message || 'Ошибка при получении пациентов'
        }
      } catch (error) {
        console.error('Ошибка при получении пациентов:', error)
        this.error = 'Не удалось загрузить список пациентов. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Фильтрация пациентов (не нужна в этой реализации, так как используется computed property)
    filterPatients() {
      // Фильтрация происходит автоматически через вычисляемые свойства
    },

    // Подтверждение удаления пациента
    confirmDeletePatient(patient) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить пациента ${patient.pname}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deletePatient(patient.pid)
        }
      })
    },

    // Удаление пациента
    async deletePatient(id) {
      this.deleteInProgress = true

      try {
        const response = await AdminPatientService.deletePatient(id)

        if (response.status === 'success') {
          // Показываем уведомление об успешном удалении
          this.$swal({
            title: 'Удалено!',
            text: 'Пациент успешно удален',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список пациентов
          this.fetchPatients()
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось удалить пациента',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при удалении пациента:', error)
        let errorMessage = 'Не удалось удалить пациента. Пожалуйста, попробуйте позже.'

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
    },

    // Форматирование даты
    formatDate(dateString) {
      return this.$moment(dateString).format('DD.MM.YYYY')
    }
  }
}
</script>

<style scoped>
/* Импорт Bootstrap Icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");
</style>