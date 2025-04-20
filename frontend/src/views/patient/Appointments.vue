<template>
  <div class="appointments-page">
    <h1>Мои записи на прием</h1>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="status-filter" class="form-label">Статус</label>
            <select class="form-select" id="status-filter" v-model="statusFilter">
              <option value="all">Все записи</option>
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

    <!-- Список записей -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка записей...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="filteredAppointments.length === 0" class="alert alert-info">
      У вас пока нет записей на прием.
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Дата и время</th>
              <th>Врач</th>
              <th>Услуга</th>
              <th>Номер в очереди</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.appoid">
              <td>
                {{ formatDate(appointment.scheduledate) }} {{ formatTime(appointment.scheduletime) }}
              </td>
              <td>{{ appointment.docname }}</td>
              <td>{{ appointment.title }}</td>
              <td>{{ appointment.apponum }}</td>
              <td>
                <span
                  :class="isUpcoming(appointment.scheduledate) ? 'badge bg-primary' : 'badge bg-secondary'"
                >
                  {{ isUpcoming(appointment.scheduledate) ? 'Предстоящий' : 'Прошедший' }}
                </span>
              </td>
              <td>
                <router-link
                  :to="`/patient/appointments/${appointment.appoid}`"
                  class="btn btn-sm btn-info me-2"
                >
                  Подробнее
                </router-link>
                <button
                  v-if="isUpcoming(appointment.scheduledate)"
                  class="btn btn-sm btn-danger"
                  @click="confirmCancelAppointment(appointment)"
                  :disabled="cancelInProgress"
                >
                  Отменить
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
import AppointmentService from '@/services/appointment.service'

export default {
  name: 'PatientAppointments',
  data() {
    return {
      appointments: [],
      loading: false,
      error: null,
      statusFilter: 'all',
      sortBy: 'date-desc',
      cancelInProgress: false
    }
  },
  computed: {
    // Отфильтрованный и отсортированный список записей
    filteredAppointments() {
      let result = [...this.appointments]

      // Фильтрация по статусу
      if (this.statusFilter === 'upcoming') {
        result = result.filter(appointment =>
          this.isUpcoming(appointment.scheduledate)
        )
      } else if (this.statusFilter === 'past') {
        result = result.filter(appointment =>
          !this.isUpcoming(appointment.scheduledate)
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
    this.fetchAppointments()
  },
  methods: {
    // Получение списка записей
    async fetchAppointments() {
      this.loading = true
      this.error = null

      try {
        const response = await AppointmentService.getMyAppointments()

        if (response.status === 'success') {
          this.appointments = response.data.appointments
        } else {
          this.error = response.message || 'Ошибка при получении записей'
        }
      } catch (error) {
        console.error('Ошибка при получении записей:', error)
        this.error = 'Не удалось загрузить список записей. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Подтверждение отмены записи
    confirmCancelAppointment(appointment) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите отменить запись на прием к ${appointment.docname} на ${this.formatDate(appointment.scheduledate)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, отменить',
        cancelButtonText: 'Нет, оставить'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cancelAppointment(appointment.appoid)
        }
      })
    },

    // Отмена записи
    async cancelAppointment(appointmentId) {
      this.cancelInProgress = true

      try {
        const response = await AppointmentService.cancelAppointment(appointmentId)

        if (response.status === 'success') {
          // Показываем уведомление об успешной отмене
          this.$swal({
            title: 'Отменено!',
            text: 'Ваша запись на прием была отменена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список записей
          this.fetchAppointments()
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось отменить запись',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при отмене записи:', error)
        let errorMessage = 'Не удалось отменить запись. Пожалуйста, попробуйте позже.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        })
      } finally {
        this.cancelInProgress = false
      }
    },

    // Проверка, является ли запись предстоящей
    isUpcoming(dateString) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const appointmentDate = new Date(dateString)

      return appointmentDate >= today
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