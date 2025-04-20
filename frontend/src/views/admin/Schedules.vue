<template>
  <div class="schedules-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Управление расписаниями</h1>
      <router-link to="/admin/schedules/create" class="btn btn-primary">
        Создать новое расписание
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="doctor-filter" class="form-label">Врач</label>
            <select
              class="form-select"
              id="doctor-filter"
              v-model="doctorFilter"
              @change="filterSchedules"
            >
              <option value="">Все врачи</option>
              <option
                v-for="doctor in doctors"
                :key="doctor.docid"
                :value="doctor.docid"
              >
                {{ doctor.docname }}
              </option>
            </select>
          </div>
          <div class="col-md-4 mb-3">
            <label for="date-filter" class="form-label">Дата</label>
            <input
              type="date"
              class="form-control"
              id="date-filter"
              v-model="dateFilter"
              @change="filterSchedules"
            >
          </div>
          <div class="col-md-4 mb-3">
            <label for="status-filter" class="form-label">Статус</label>
            <select
              class="form-select"
              id="status-filter"
              v-model="statusFilter"
              @change="filterSchedules"
            >
              <option value="all">Все расписания</option>
              <option value="upcoming">Предстоящие</option>
              <option value="past">Прошедшие</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Список расписаний -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка расписаний...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="filteredSchedules.length === 0" class="alert alert-info">
      Расписания не найдены.
      <span v-if="doctorFilter || dateFilter || statusFilter !== 'all'">
        Попробуйте изменить параметры фильтрации.
      </span>
      <span v-else>
        <router-link to="/admin/schedules/create">Создать новое расписание</router-link>
      </span>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Врач</th>
            <th>Дата</th>
            <th>Время</th>
            <th>Название</th>
            <th>Записи</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schedule in filteredSchedules" :key="schedule.scheduleid">
            <td>{{ schedule.scheduleid }}</td>
            <td>{{ schedule.docname }}</td>
            <td>{{ formatDate(schedule.scheduledate) }}</td>
            <td>{{ formatTime(schedule.scheduletime) }}</td>
            <td>{{ schedule.title }}</td>
            <td>
              {{ schedule.bookedSlots }} / {{ schedule.nop }}
              ({{ calculateBookingPercentage(schedule) }}%)
            </td>
            <td>
              <span
                :class="isUpcoming(schedule.scheduledate) ? 'badge bg-primary' : 'badge bg-secondary'"
              >
                {{ isUpcoming(schedule.scheduledate) ? 'Предстоящее' : 'Прошедшее' }}
              </span>
            </td>
            <td>
              <div class="btn-group">
                <router-link
                  :to="`/admin/schedules/${schedule.scheduleid}`"
                  class="btn btn-sm btn-info"
                  title="Просмотр"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
                <router-link
                  :to="`/admin/schedules/${schedule.scheduleid}/edit`"
                  class="btn btn-sm btn-primary"
                  title="Редактировать"
                >
                  <i class="bi bi-pencil"></i>
                </router-link>
                <button
                  class="btn btn-sm btn-danger"
                  title="Удалить"
                  @click="confirmDeleteSchedule(schedule)"
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
import AdminScheduleService from '@/services/admin-schedule.service'
import AdminDoctorService from '@/services/admin-doctor.service'

export default {
  name: 'AdminSchedules',
  data() {
    return {
      schedules: [],
      doctors: [],
      doctorFilter: '',
      dateFilter: '',
      statusFilter: 'all',
      loading: false,
      error: null,
      deleteInProgress: false
    }
  },
  computed: {
    // Отфильтрованный список расписаний
    filteredSchedules() {
      return this.schedules.filter(schedule => {
        // Фильтрация по врачу
        const matchesDoctor = !this.doctorFilter ||
          schedule.docid == this.doctorFilter;

        // Фильтрация по дате
        const matchesDate = !this.dateFilter ||
          schedule.scheduledate === this.dateFilter;

        // Фильтрация по статусу
        let matchesStatus = true;
        if (this.statusFilter === 'upcoming') {
          matchesStatus = this.isUpcoming(schedule.scheduledate);
        } else if (this.statusFilter === 'past') {
          matchesStatus = !this.isUpcoming(schedule.scheduledate);
        }

        return matchesDoctor && matchesDate && matchesStatus;
      });
    }
  },
  created() {
    this.fetchSchedules()
    this.fetchDoctors()
  },
  methods: {
    // Получение списка расписаний
    async fetchSchedules() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminScheduleService.getAllSchedules()

        if (response.status === 'success') {
          this.schedules = response.data.schedules
        } else {
          this.error = response.message || 'Ошибка при получении расписаний'
        }
      } catch (error) {
        console.error('Ошибка при получении расписаний:', error)
        this.error = 'Не удалось загрузить список расписаний. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Получение списка врачей для фильтра
    async fetchDoctors() {
      try {
        const response = await AdminDoctorService.getAllDoctors()

        if (response.status === 'success') {
          this.doctors = response.data.doctors
        }
      } catch (error) {
        console.error('Ошибка при получении врачей:', error)
      }
    },

    // Фильтрация расписаний (не нужна в этой реализации, так как используется computed property)
    filterSchedules() {
      // Фильтрация происходит автоматически через вычисляемые свойства
    },

    // Подтверждение удаления расписания
    confirmDeleteSchedule(schedule) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить расписание "${schedule.title}" на ${this.formatDate(schedule.scheduledate)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteSchedule(schedule.scheduleid)
        }
      })
    },

    // Удаление расписания
    async deleteSchedule(id) {
      this.deleteInProgress = true

      try {
        const response = await AdminScheduleService.deleteSchedule(id)

        if (response.status === 'success') {
          // Показываем уведомление об успешном удалении
          this.$swal({
            title: 'Удалено!',
            text: 'Расписание успешно удалено',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список расписаний
          this.fetchSchedules()
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось удалить расписание',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при удалении расписания:', error)
        let errorMessage = 'Не удалось удалить расписание. Пожалуйста, попробуйте позже.'

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

    // Расчет процента заполнения расписания
    calculateBookingPercentage(schedule) {
      if (schedule.nop === 0) return 0
      return Math.round((schedule.bookedSlots / schedule.nop) * 100)
    },

    // Проверка, является ли расписание предстоящим
    isUpcoming(dateString) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const scheduleDate = new Date(dateString)

      return scheduleDate >= today
    },

    // Форматирование даты
    formatDate(dateString) {
      return this.$moment(dateString).format('DD.MM.YYYY')
    },

    // Форматирование времени
    formatTime(timeString) {
      return timeString.substring(0, 5)
    }
  }
}
</script>

<style scoped>
/* Импорт Bootstrap Icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");
</style>