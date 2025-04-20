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
        <h1>Информация о расписании</h1>
        <div>
          <router-link
            :to="`/admin/schedules/${schedule.scheduleid}/edit`"
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
          <h5 class="mb-0">Детали расписания</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>ID расписания:</strong> {{ schedule.scheduleid }}</p>
              <p><strong>Название:</strong> {{ schedule.title }}</p>
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
              <p><strong>Врач:</strong> {{ schedule.docname }}</p>
              <p><strong>Email врача:</strong> {{ schedule.docemail }}</p>
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

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>№</th>
              <th>ID записи</th>
              <th>Пациент</th>
              <th>Email</th>
              <th>Дата записи</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in appointments" :key="appointment.appoid">
              <td>{{ appointment.apponum }}</td>
              <td>{{ appointment.appoid }}</td>
              <td>{{ appointment.pname }}</td>
              <td>{{ appointment.pemail }}</td>
              <td>{{ formatDate(appointment.appodate) }}</td>
              <td>
                <div class="btn-group">
                  <router-link
                    :to="`/admin/appointments/${appointment.appoid}`"
                    class="btn btn-sm btn-info"
                    title="Просмотр"
                  >
                    <i class="bi bi-eye"></i>
                  </router-link>
                  <button
                    class="btn btn-sm btn-danger"
                    title="Отменить"
                    @click="confirmCancelAppointment(appointment)"
                    :disabled="cancelInProgress"
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4">
        <router-link to="/admin/schedules" class="btn btn-secondary">
          Назад к списку расписаний
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AdminScheduleService from '@/services/admin-schedule.service'
import AdminAppointmentService from '@/services/admin-appointment.service'

export default {
  name: 'AdminScheduleDetail',
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
        const response = await AdminScheduleService.getSchedule(this.$route.params.id)

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
        const response = await AdminScheduleService.deleteSchedule(this.schedule.scheduleid)

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
          this.$router.push('/admin/schedules')
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
        const response = await AdminAppointmentService.cancelAppointment(appointmentId)

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

<style scoped>
/* Импорт Bootstrap Icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");
</style>