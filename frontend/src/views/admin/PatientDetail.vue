<template>
  <div class="patient-detail-page">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка информации о пациенте...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>{{ patient.pname }}</h1>
        <div>
          <router-link
            :to="`/admin/patients/${patient.pid}/edit`"
            class="btn btn-primary me-2"
          >
            Редактировать
          </router-link>
          <button
            class="btn btn-danger"
            @click="confirmDeletePatient"
            :disabled="deleteInProgress"
          >
            <span v-if="deleteInProgress" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Удалить
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Личная информация</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>ID:</strong> {{ patient.pid }}</p>
              <p><strong>ФИО:</strong> {{ patient.pname }}</p>
              <p><strong>Email:</strong> {{ patient.pemail }}</p>
              <p><strong>Дата рождения:</strong> {{ formatDate(patient.pdob) }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Телефон:</strong> {{ patient.ptel || 'Не указан' }}</p>
              <p><strong>Паспорт/ID:</strong> {{ patient.pnic || 'Не указан' }}</p>
              <p><strong>Адрес:</strong> {{ patient.paddress || 'Не указан' }}</p>
            </div>
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
            У пациента нет записей на прием.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата и время</th>
                  <th>Врач</th>
                  <th>Услуга</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in appointments" :key="appointment.appoid">
                  <td>{{ appointment.appoid }}</td>
                  <td>{{ formatDate(appointment.scheduledate) }} {{ formatTime(appointment.scheduletime) }}</td>
                  <td>{{ appointment.docname }}</td>
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
        <router-link to="/admin/patients" class="btn btn-secondary">
          Назад к списку пациентов
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AdminPatientService from '@/services/admin-patient.service'
import AdminAppointmentService from '@/services/admin-appointment.service'

export default {
  name: 'PatientDetail',
  data() {
    return {
      patient: {},
      appointments: [],
      loading: false,
      error: null,
      loadingAppointments: false,
      errorAppointments: null,
      deleteInProgress: false
    }
  },
  created() {
    this.fetchPatient()
    this.fetchAppointments()
  },
  methods: {
    // Получение информации о пациенте
    async fetchPatient() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminPatientService.getPatient(this.$route.params.id)

        if (response.status === 'success') {
          this.patient = response.data.patient
        } else {
          this.error = response.message || 'Ошибка при получении информации о пациенте'
        }
      } catch (error) {
        console.error('Ошибка при получении пациента:', error)
        this.error = 'Не удалось загрузить информацию о пациенте. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Получение записей на прием пациента
    async fetchAppointments() {
      this.loadingAppointments = true
      this.errorAppointments = null

      try {
        // Здесь должен быть запрос для получения записей пациента
        // В реальном приложении нужно реализовать этот метод в сервисе
        const response = await AdminAppointmentService.getPatientAppointments(this.$route.params.id)

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

    // Подтверждение удаления пациента
    confirmDeletePatient() {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить пациента ${this.patient.pname}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deletePatient()
        }
      })
    },

    // Удаление пациента
    async deletePatient() {
      this.deleteInProgress = true

      try {
        const response = await AdminPatientService.deletePatient(this.patient.pid)

        if (response.status === 'success') {
          // Показываем уведомление об успешном удалении
          this.$swal({
            title: 'Удалено!',
            text: 'Пациент успешно удален',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем на страницу со списком пациентов
          this.$router.push('/admin/patients')
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