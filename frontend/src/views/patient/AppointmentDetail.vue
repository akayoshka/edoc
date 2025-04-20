<template>
  <div class="appointment-detail-page">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка информации о записи...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <h1>Информация о записи на прием</h1>

      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Детали записи</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Номер записи:</strong> #{{ appointment.appoid }}</p>
              <p><strong>Дата создания:</strong> {{ formatDate(appointment.appodate) }}</p>
              <p><strong>Номер в очереди:</strong> {{ appointment.apponum }}</p>
              <p>
                <strong>Статус:</strong>
                <span
                  :class="isUpcoming(appointment.scheduledate) ? 'badge bg-primary' : 'badge bg-secondary'"
                >
                  {{ isUpcoming(appointment.scheduledate) ? 'Предстоящий' : 'Прошедший' }}
                </span>
              </p>
            </div>
            <div class="col-md-6">
              <p><strong>Дата приема:</strong> {{ formatDate(appointment.scheduledate) }}</p>
              <p><strong>Время приема:</strong> {{ formatTime(appointment.scheduletime) }}</p>
              <p><strong>Услуга:</strong> {{ appointment.title }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Информация о враче</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>ФИО:</strong> {{ appointment.docname }}</p>
              <p><strong>Email:</strong> {{ appointment.docemail }}</p>
            </div>
            <div class="col-md-6">
              <router-link
                :to="`/patient/doctors/${appointment.docid}`"
                class="btn btn-primary"
              >
                Карточка врача
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex">
        <router-link to="/patient/appointments" class="btn btn-secondary me-2">
          Назад к списку записей
        </router-link>

        <button
          v-if="isUpcoming(appointment.scheduledate)"
          class="btn btn-danger"
          @click="confirmCancelAppointment"
          :disabled="cancelInProgress"
        >
          <span v-if="cancelInProgress" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Отменить запись
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AppointmentService from '@/services/appointment.service'

export default {
  name: 'PatientAppointmentDetail',
  data() {
    return {
      appointment: {},
      loading: false,
      error: null,
      cancelInProgress: false
    }
  },
  created() {
    this.fetchAppointment()
  },
  methods: {
    // Получение информации о записи
    async fetchAppointment() {
      this.loading = true
      this.error = null

      try {
        const response = await AppointmentService.getAppointment(this.$route.params.id)

        if (response.status === 'success') {
          this.appointment = response.data.appointment
        } else {
          this.error = response.message || 'Ошибка при получении информации о записи'
        }
      } catch (error) {
        console.error('Ошибка при получении записи:', error)
        this.error = 'Не удалось загрузить информацию о записи. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Подтверждение отмены записи
    confirmCancelAppointment() {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите отменить запись на прием к ${this.appointment.docname} на ${this.formatDate(this.appointment.scheduledate)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, отменить',
        cancelButtonText: 'Нет, оставить'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cancelAppointment()
        }
      })
    },

    // Отмена записи
    async cancelAppointment() {
      this.cancelInProgress = true

      try {
        const response = await AppointmentService.cancelAppointment(this.appointment.appoid)

        if (response.status === 'success') {
          // Показываем уведомление об успешной отмене
          this.$swal({
            title: 'Отменено!',
            text: 'Ваша запись на прием была отменена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем пользователя на список записей
          this.$router.push('/patient/appointments')
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