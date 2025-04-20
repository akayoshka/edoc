<template>
  <div class="schedules-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Мое расписание</h1>
      <router-link to="/doctor/schedules/create" class="btn btn-primary">
        Создать новое расписание
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="status-filter" class="form-label">Статус</label>
            <select class="form-select" id="status-filter" v-model="statusFilter">
              <option value="all">Все расписания</option>
              <option value="upcoming">Предстоящие</option>
              <option value="past">Прошедшие</option>
            </select>
          </div>
          <div class="col-md-4 mb-3">
            <label for="sort-by" class="form-label">Сортировка</label>
            <select class="form-select" id="sort-by" v-model="sortBy">
              <option value="date-asc">По дате (старые в начале)</option>
              <option value="date-desc">По дате (новые в начале)</option>
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
      У вас пока нет расписаний. Создайте новое расписание, чтобы пациенты могли записаться на прием.
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
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
                <router-link
                  :to="`/doctor/schedules/${schedule.scheduleid}`"
                  class="btn btn-sm btn-info me-2"
                >
                  Просмотр
                </router-link>
                <router-link
                  v-if="isUpcoming(schedule.scheduledate)"
                  :to="`/doctor/schedules/${schedule.scheduleid}/edit`"
                  class="btn btn-sm btn-primary me-2"
                >
                  Изменить
                </router-link>
                <button
                  v-if="isUpcoming(schedule.scheduledate)"
                  class="btn btn-sm btn-danger"
                  @click="confirmDeleteSchedule(schedule)"
                  :disabled="deleteInProgress"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import DoctorScheduleService from '@/services/doctor-schedule.service'

export default {
  name: 'DoctorSchedules',
  data() {
    return {
      schedules: [],
      loading: false,
      error: null,
      statusFilter: 'all',
      sortBy: 'date-desc',
      deleteInProgress: false
    }
  },
  computed: {
    // Отфильтрованный и отсортированный список расписаний
    filteredSchedules() {
      let result = [...this.schedules]

      // Фильтрация по статусу
      if (this.statusFilter === 'upcoming') {
        result = result.filter(schedule =>
          this.isUpcoming(schedule.scheduledate)
        )
      } else if (this.statusFilter === 'past') {
        result = result.filter(schedule =>
          !this.isUpcoming(schedule.scheduledate)
        )
      }

      // Сортировка по дате
      result.sort((a, b) => {
        const dateA = new Date(`${a.scheduledate}T${a.scheduletime}`)
        const dateB = new Date(`${b.scheduledate}T${b.scheduletime}`)

        if (this.sortBy === 'date-asc') {
          return dateA - dateB
        } else {
          return dateB - dateA
        }
      })

      return result
    }
  },
  created() {
    this.fetchSchedules()
  },
  methods: {
    // Получение списка расписаний
    async fetchSchedules() {
      this.loading = true
      this.error = null

      try {
        const response = await DoctorScheduleService.getMySchedules()

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

    // Подтверждение удаления расписания
    confirmDeleteSchedule(schedule) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить расписание "${schedule.title}" на ${this.formatDate(schedule.scheduledate)}? Все записи пациентов на это расписание будут отменены.`,
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
    async deleteSchedule(scheduleId) {
      this.deleteInProgress = true

      try {
        const response = await DoctorScheduleService.deleteSchedule(scheduleId)

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

    // Проверка, является ли расписание предстоящим
    isUpcoming(dateString) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const scheduleDate = new Date(dateString)

      return scheduleDate >= today
    },

    // Расчет процента заполнения расписания
    calculateBookingPercentage(schedule) {
      if (schedule.nop === 0) return 0
      return Math.round((schedule.bookedSlots / schedule.nop) * 100)
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