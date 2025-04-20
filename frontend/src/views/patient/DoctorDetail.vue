<template>
  <div class="doctor-detail-page">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка информации о враче...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <h1>{{ doctor.docname }}</h1>
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Информация о враче</h5>
          <div class="row">
            <div class="col-md-6">
              <p><strong>Специальность:</strong> {{ doctor.specialty_name }}</p>
              <p><strong>Email:</strong> {{ doctor.docemail }}</p>
              <p><strong>Телефон:</strong> {{ doctor.doctel || 'Не указан' }}</p>
            </div>
          </div>
        </div>
      </div>

      <h2>Доступные расписания</h2>
      <div v-if="loadingSchedules" class="text-center py-3">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Загрузка расписаний...
      </div>

      <div v-else-if="errorSchedules" class="alert alert-danger">
        {{ errorSchedules }}
      </div>

      <div v-else-if="schedules.length === 0" class="alert alert-info">
        У этого врача нет доступных расписаний.
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Время</th>
                <th>Название</th>
                <th>Доступно мест</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="schedule in schedules" :key="schedule.scheduleid">
                <td>{{ formatDate(schedule.scheduledate) }}</td>
                <td>{{ formatTime(schedule.scheduletime) }}</td>
                <td>{{ schedule.title }}</td>
                <td>
                  <span
                    :class="schedule.availableSlots > 0 ? 'text-success' : 'text-danger'"
                  >
                    {{ schedule.availableSlots }} из {{ schedule.nop }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-primary btn-sm"
                    :disabled="schedule.availableSlots <= 0 || bookingInProgress"
                    @click="bookAppointment(schedule.scheduleid)"
                  >
                    <span v-if="bookingScheduleId === schedule.scheduleid" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Записаться
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <router-link to="/patient/doctors" class="btn btn-secondary">
        Назад к списку врачей
      </router-link>
    </div>
  </div>
</template>

<script>
import DoctorService from '@/services/doctor.service'
import ScheduleService from '@/services/schedule.service'
import AppointmentService from '@/services/appointment.service'

export default {
  name: 'PatientDoctorDetail',
  data() {
    return {
      doctor: {},
      schedules: [],
      loading: false,
      error: null,
      loadingSchedules: false,
      errorSchedules: null,
      bookingInProgress: false,
      bookingScheduleId: null
    }
  },
  created() {
    this.fetchDoctor()
  },
  methods: {
    // Получение информации о враче
    async fetchDoctor() {
      this.loading = true
      this.error = null

      try {
        const response = await DoctorService.getDoctor(this.$route.params.id)

        if (response.status === 'success') {
          this.doctor = response.data.doctor
          this.fetchDoctorSchedules()
        } else {
          this.error = response.message || 'Ошибка при получении информации о враче'
        }
      } catch (error) {
        console.error('Ошибка при получении врача:', error)
        this.error = 'Не удалось загрузить информацию о враче. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Получение расписаний врача
    async fetchDoctorSchedules() {
      this.loadingSchedules = true
      this.errorSchedules = null

      try {
        const response = await ScheduleService.searchSchedules({
          doctorId: this.doctor.docid
        })

        if (response.status === 'success') {
          this.schedules = response.data.schedules
        } else {
          this.errorSchedules = response.message || 'Ошибка при получении расписаний'
        }
      } catch (error) {
        console.error('Ошибка при получении расписаний:', error)
        this.errorSchedules = 'Не удалось загрузить расписания. Пожалуйста, попробуйте позже.'
      } finally {
        this.loadingSchedules = false
      }
    },

    // Запись на прием
    async bookAppointment(scheduleId) {
      this.bookingInProgress = true
      this.bookingScheduleId = scheduleId

      try {
        const response = await AppointmentService.createAppointment(scheduleId)

        if (response.status === 'success') {
          // Показываем уведомление об успешной записи
          this.$swal({
            title: 'Успешно!',
            text: 'Вы успешно записались на прием',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список расписаний
          this.fetchDoctorSchedules()
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось записаться на прием',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при записи на прием:', error)
        let errorMessage = 'Не удалось записаться на прием. Пожалуйста, попробуйте позже.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        })
      } finally {
        this.bookingInProgress = false
        this.bookingScheduleId = null
      }
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