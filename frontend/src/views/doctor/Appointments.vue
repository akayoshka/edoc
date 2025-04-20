<template>
  <div class="appointments-page">
    <h1>Записи пациентов</h1>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="date-filter" class="form-label">Дата</label>
            <input
              type="date"
              class="form-control"
              id="date-filter"
              v-model="dateFilter"
              @change="fetchAppointmentsByDate"
            >
          </div>
          <div class="col-md-4 mb-3">
            <button
              class="btn btn-primary mt-4"
              @click="resetDateFilter"
            >
              Сбросить фильтр даты
            </button>
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

    <div v-else-if="appointments.length === 0" class="alert alert-info">
      У вас пока нет записей на прием.
      <span v-if="dateFilter">
        <br>Попробуйте выбрать другую дату или сбросить фильтр даты.
      </span>
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Дата и время</th>
              <th>Пациент</th>
              <th>Email</th>
              <th>Услуга</th>
              <th>№ в очереди</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in appointments" :key="appointment.appoid">
              <td>
                {{ formatDate(appointment.scheduledate) }} {{ formatTime(appointment.scheduletime) }}
              </td>
              <td>{{ appointment.pname }}</td>
              <td>{{ appointment.pemail }}</td>
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
                  :to="`/doctor/appointments/${appointment.appoid}`"
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
import DoctorAppointmentService from '@/services/doctor-appointment.service'

export default {
  name: 'DoctorAppointments',
  data() {
    return {
      appointments: [],
      loading: false,
      error: null,
      dateFilter: '',
      cancelInProgress: false
    }
  },
  created() {
    this.fetchAppointments()
  },
  methods: {
    // Получение всех записей
    async fetchAppointments() {
      this.loading = true
      this.error = null

      try {
        const response = await DoctorAppointmentService.getMyAppointments()

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

    // Получение записей по дате
    async fetchAppointmentsByDate() {
      if (!this.dateFilter) {
        return this.fetchAppointments()
      }

      this.loading = true
      this.error = null

      try {
        const response = await DoctorAppointmentService.getAppointmentsByDate(this.dateFilter)

        if (response.status === 'success') {
          this.appointments = response.data.appointments
        } else {
          this.error = response.message || 'Ошибка при получении записей'
        }
      } catch (error) {
        console.error('Ошибка при получении записей по дате:', error)
        this.error = 'Не удалось загрузить список записей. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Сброс фильтра даты
    resetDateFilter() {
      this.dateFilter = ''
      this.fetchAppointments()
    },

    // Подтверждение отмены записи
    confirmCancelAppointment(appointment) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите отменить запись пациента ${appointment.pname} на ${this.formatDate(appointment.scheduledate)}?`,
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
        const response = await DoctorAppointmentService.cancelAppointment(appointmentId)

        if (response.status === 'success') {
          // Показываем уведомление об успешной отмене
          this.$swal({
            title: 'Отменено!',
            text: 'Запись пациента была отменена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список записей
          if (this.dateFilter) {
            this.fetchAppointmentsByDate()
          } else {
            this.fetchAppointments()
          }
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