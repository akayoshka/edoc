<template>
  <div class="schedule-detail-page">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка информации о расписании...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>{{ schedule.title }}</h1>
        <div v-if="isUpcoming(schedule.scheduledate)">
          <router-link
            :to="`/doctor/schedules/${schedule.scheduleid}/edit`"
            class="btn btn-primary me-2"
          >
            Редактировать
          </router-link>
          <button
            class="btn btn-danger"
            @click="confirmDeleteSchedule"
            :disabled="deleteInProgress"
          >
            <span v-if="deleteInProgress" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Удалить
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Информация о расписании</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Дата:</strong> {{ formatDate(schedule.scheduledate) }}</p>
              <p><strong>Время:</strong> {{ formatTime(schedule.scheduletime) }}</p>
              <p>
                <strong>Статус:</strong>
                <span
                  :class="isUpcoming(schedule.scheduledate) ? 'badge bg-primary' : 'badge bg-secondary'"
                >
                  {{ isUpcoming(schedule.scheduledate) ? 'Предстоящее' : 'Прошедшее' }}
                </span>
              </p>
            </div>
            <div class="col-md-6">
              <p><strong>Общее количество мест:</strong> {{ schedule.nop }}</p>
              <p><strong>Забронировано мест:</strong> {{ schedule.bookedSlots }}</p>
              <p><strong>Доступно мест:</strong> {{ schedule.availableSlots }}</p>
            </div>
          </div>
        </div>
      </div>

      <h2>Записи пациентов</h2>
      <div v-if="appointments.length === 0" class="alert alert-info">
        На это расписание пока нет записей от пациентов.
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>№</th>
                <th>Пациент</th>
                <th>Email</th>
                <th>Дата записи</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in appointments" :key="appointment.appoid">
                <td>{{ appointment.apponum }}</td>
                <td>{{ appointment.pname }}</td>
                <td>{{ appointment.pemail }}</td>
                <td>{{ formatDate(appointment.appodate) }}</td>
                <td>
                  <button
                    v-if="isUpcoming(schedule.scheduledate)"
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

      <div class="mt-4">
        <router-link to="/doctor/schedules" class="btn btn-secondary">
          Назад к списку расписаний
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import DoctorScheduleService from '@/services/doctor-schedule.service'
import DoctorAppointmentService from '@/services/doctor-appointment.service'

export default {
  name: 'DoctorScheduleDetail',
  data() {
    return {
      schedule: {},
      appointments: [],
      loading: false,
      error: null,
      deleteInProgress: false,
      cancelInProgress: false
    }
  },
  created() {
    this.fetchSchedule()
  },
  methods: {
    // Получение информации о расписании
    async fetchSchedule() {
      this.loading = true
      this.error = null

      try {
        const response = await DoctorScheduleService.getSchedule(this.$route.params.id)

        if (response.status === 'success') {
          this.schedule = response.data.schedule
          this.appointments = response.data.appointments || []
        } else {
          this.error = response.message || 'Ошибка при получении информации о расписании'
        }
      } catch (error) {
        console.error('Ошибка при получении расписания:', error)
        this.error = 'Не удалось загрузить информацию о расписании. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Подтверждение удаления расписания
    confirmDeleteSchedule() {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить расписание "${this.schedule.title}" на ${this.formatDate(this.schedule.scheduledate)}? Все записи пациентов на это расписание будут отменены.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteSchedule()
        }
      })
    },

    // Удаление расписания
    async deleteSchedule() {
      this.deleteInProgress = true

      try {
        const response = await DoctorScheduleService.deleteSchedule(this.schedule.scheduleid)

        if (response.status === 'success') {
          // Показываем уведомление об успешном удалении
          this.$swal({
            title: 'Удалено!',
            text: 'Расписание успешно удалено',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем на страницу со списком расписаний
          this.$router.push('/doctor/schedules')
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

    // Подтверждение отмены записи пациента
    confirmCancelAppointment(appointment) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите отменить запись пациента ${appointment.pname}?`,
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

    // Отмена записи пациента
    async cancelAppointment(appointmentId) {
      this.cancelInProgress = true

      try {
        const response = await DoctorAppointmentService.cancelAppointment(appointmentId)

        if (response.status === 'success') {
          // Показываем уведомление об успешной отмене
          this.$swal({
            title: 'Отменено!',
            text: 'Запись пациента успешно отменена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем информацию о расписании
          this.fetchSchedule()
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