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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>{{ doctor.docname }}</h1>
        <div>
          <router-link
            :to="`/admin/doctors/${doctor.docid}/edit`"
            class="btn btn-primary me-2"
          >
            Редактировать
          </router-link>
          <button
            class="btn btn-danger"
            @click="confirmDeleteDoctor"
            :disabled="deleteInProgress"
          >
            <span v-if="deleteInProgress" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Удалить
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Информация о враче</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>ID:</strong> {{ doctor.docid }}</p>
              <p><strong>ФИО:</strong> {{ doctor.docname }}</p>
              <p><strong>Email:</strong> {{ doctor.docemail }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Специальность:</strong> {{ doctor.specialty_name }}</p>
              <p><strong>Телефон:</strong> {{ doctor.doctel || 'Не указан' }}</p>
              <p><strong>Паспорт/ID:</strong> {{ doctor.docnic || 'Не указан' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Расписания</h5>
          <div>
            <button
              class="btn btn-primary btn-sm me-2"
              @click="fetchSchedules"
              :disabled="loadingSchedules"
            >
              <span v-if="loadingSchedules" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Обновить
            </button>
            <router-link :to="`/admin/schedules/create?doctorId=${doctor.docid}`" class="btn btn-success btn-sm">
              Добавить расписание
            </router-link>
          </div>
        </div>
        <div class="card-body">
          <div v-if="loadingSchedules" class="text-center py-3">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <p class="mt-2">Загрузка расписаний...</p>
          </div>

          <div v-else-if="errorSchedules" class="alert alert-danger">
            {{ errorSchedules }}
          </div>

          <div v-else-if="schedules.length === 0" class="alert alert-info">
            У врача нет расписаний.
          </div>

          <div v-else class="table-responsive">
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
                <tr v-for="schedule in schedules" :key="schedule.scheduleid">
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
                      :to="`/admin/schedules/${schedule.scheduleid}`"
                      class="btn btn-sm btn-info"
                    >
                      Подробнее
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Записи на прием</h5>
          <button
            class="btn btn-primary btn-sm"
            @click="fetchAppointments"
            :disabled="loadingAppointments"
          >
            <span v-if="loadingAppointments" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Обновить
          </button>
        </div>
        <div class="card-body">
          <div v-if="loadingAppointments" class="text-center py-3">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <p class="mt-2">Загрузка записей...</p>
          </div>

          <div v-else-if="errorAppointments" class="alert alert-danger">
            {{ errorAppointments }}
          </div>

          <div v-else-if="appointments.length === 0" class="alert alert-info">
            У врача нет записей на прием.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Дата и время</th>
                  <th>Пациент</th>
                  <th>Услуга</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in appointments" :key="appointment.appoid">
                  <td>{{ formatDate(appointment.scheduledate) }} {{ formatTime(appointment.scheduletime) }}</td>
                  <td>{{ appointment.pname }}</td>
                  <td>{{ appointment.title }}</td>
                  <td>
                    <span
                      :class="isUpcoming(appointment.scheduledate) ? 'badge bg-primary' : 'badge bg-secondary'"
                    >
                      {{ isUpcoming(appointment.scheduledate) ? 'Предстоящий' : 'Прошедший' }}
                    </span>
                  </td>
                  <td>
                    <router-link
                      :to="`/admin/appointments/${appointment.appoid}`"
                      class="btn btn-sm btn-info"
                    >
                      Подробнее
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <router-link to="/admin/doctors" class="btn btn-secondary">
          Назад к списку врачей
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AdminDoctorService from '@/services/admin-doctor.service'
import AdminScheduleService from '@/services/admin-schedule.service'
import AdminAppointmentService from '@/services/admin-appointment.service'

export default {
  name: 'DoctorDetail',
  data() {
    return {
      doctor: {},
      schedules: [],
      appointments: [],
      loading: false,
      error: null,
      loadingSchedules: false,
      errorSchedules: null,
      loadingAppointments: false,
      errorAppointments: null,
      deleteInProgress: false
    }
  },
  created() {
    this.fetchDoctor()
    this.fetchSchedules()
    this.fetchAppointments()
  },
  methods: {
    // Получение информации о враче
    async fetchDoctor() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminDoctorService.getDoctor(this.$route.params.id)

        if (response.status === 'success') {
          this.doctor = response.data.doctor
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
    async fetchSchedules() {
      this.loadingSchedules = true
      this.errorSchedules = null

      try {
        // Здесь должен быть запрос для получения расписаний врача
        // В реальном приложении нужно реализовать этот метод в сервисе
        const response = await AdminScheduleService.getDoctorSchedules(this.$route.params.id)

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

    // Получение записей на прием врача
    async fetchAppointments() {
      this.loadingAppointments = true
      this.errorAppointments = null

      try {
        // Здесь должен быть запрос для получения записей врача
        // В реальном приложении нужно реализовать этот метод в сервисе
        const response = await AdminAppointmentService.getDoctorAppointments(this.$route.params.id)

        if (response.status === 'success') {
          this.appointments = response.data.appointments
        } else {
          this.errorAppointments = response.message || 'Ошибка при получении записей на прием'
        }
      } catch (error) {
        console.error('Ошибка при получении записей:', error)
        this.errorAppointments = 'Не удалось загрузить записи на прием. Пожалуйста, попробуйте позже.'
      } finally {
        this.loadingAppointments = false
      }
    },

    // Подтверждение удаления врача
    confirmDeleteDoctor() {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить врача ${this.doctor.docname}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteDoctor()
        }
      })
    },

    // Удаление врача
    async deleteDoctor() {
      this.deleteInProgress = true

      try {
        const response = await AdminDoctorService.deleteDoctor(this.doctor.docid)

        if (response.status === 'success') {
          // Показываем уведомление об успешном удалении
          this.$swal({
            title: 'Удалено!',
            text: 'Врач успешно удален',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем на страницу со списком врачей
          this.$router.push('/admin/doctors')
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
    },

    // Расчет процента заполнения расписания
    calculateBookingPercentage(schedule) {
      if (schedule.nop === 0) return 0
      return Math.round((schedule.bookedSlots / schedule.nop) * 100)
    },

    // Проверка, является ли расписание/запись предстоящей
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