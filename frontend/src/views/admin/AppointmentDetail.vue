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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Информация о записи на прием #{{ appointment.appoid }}</h1>
        <div v-if="isUpcoming(appointment.scheduledate)">
          <button
            class="btn btn-danger"
            @click="confirmCancelAppointment"
            :disabled="cancelInProgress"
          >
            <span v-if="cancelInProgress" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Отменить запись
          </button>
        </div>
      </div>

      <!-- Общая информация о записи -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Общая информация</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>ID записи:</strong> {{ appointment.appoid }}</p>
              <p><strong>Дата создания:</strong> {{ formatDate(appointment.appodate) }}</p>
              <p><strong>Номер в очереди:</strong> {{ appointment.apponum }}</p>
              <p>
                <strong>Статус:</strong>
                <span
                  :class="isUpcoming(appointment.scheduledate) ? 'badge bg-primary' : 'badge bg-secondary'"
                >
                  {{ isToday(appointment.scheduledate) ? 'Сегодня' :
                     isUpcoming(appointment.scheduledate) ? 'Предстоящий' : 'Прошедший' }}
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

      <!-- Информация о пациенте -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Информация о пациенте</h5>
              <router-link
                :to="`/admin/patients/${appointment.pid}`"
                class="btn btn-sm btn-outline-primary"
              >
                Профиль пациента
              </router-link>
            </div>
            <div class="card-body">
              <p><strong>ФИО:</strong> {{ appointment.pname }}</p>
              <p><strong>Email:</strong> {{ appointment.pemail }}</p>
              <p v-if="patientDetails"><strong>Телефон:</strong> {{ patientDetails.ptel || 'Не указан' }}</p>
              <p v-if="patientDetails"><strong>Дата рождения:</strong> {{ formatDate(patientDetails.pdob) }}</p>
              <p v-if="patientDetails"><strong>Адрес:</strong> {{ patientDetails.paddress || 'Не указан' }}</p>
            </div>
          </div>
        </div>

        <!-- Информация о враче -->
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Информация о враче</h5>
              <router-link
                :to="`/admin/doctors/${appointment.docid}`"
                class="btn btn-sm btn-outline-primary"
              >
                Профиль врача
              </router-link>
            </div>
            <div class="card-body">
              <p><strong>ФИО:</strong> {{ appointment.docname }}</p>
              <p><strong>Email:</strong> {{ appointment.docemail }}</p>
              <p v-if="doctorDetails"><strong>Телефон:</strong> {{ doctorDetails.doctel || 'Не указан' }}</p>
              <p v-if="doctorDetails"><strong>Специальность:</strong> {{ doctorDetails.specialty_name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Информация о расписании -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Информация о расписании</h5>
          <router-link
            :to="`/admin/schedules/${appointment.scheduleid}`"
            class="btn btn-sm btn-outline-primary"
          >
            Детали расписания
          </router-link>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>ID расписания:</strong> {{ appointment.scheduleid }}</p>
              <p><strong>Название:</strong> {{ appointment.title }}</p>
              <p><strong>Дата:</strong> {{ formatDate(appointment.scheduledate) }}</p>
              <p><strong>Время:</strong> {{ formatTime(appointment.scheduletime) }}</p>
            </div>
            <div class="col-md-6" v-if="scheduleDetails">
              <p><strong>Всего мест:</strong> {{ scheduleDetails.nop }}</p>
              <p><strong>Занято мест:</strong> {{ scheduleDetails.bookedSlots }}</p>
              <p><strong>Доступно мест:</strong> {{ scheduleDetails.availableSlots }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <router-link to="/admin/appointments" class="btn btn-secondary">
          Назад к списку записей
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AdminAppointmentService from '@/services/admin-appointment.service';
import AdminPatientService from '@/services/admin-patient.service';
import AdminDoctorService from '@/services/admin-doctor.service';
import AdminScheduleService from '@/services/admin-schedule.service';

export default {
  name: 'AdminAppointmentDetail',
  data() {
    return {
      appointment: {},
      patientDetails: null,
      doctorDetails: null,
      scheduleDetails: null,
      loading: false,
      error: null,
      cancelInProgress: false
    }
  },
  created() {
    this.fetchAppointment();
  },
  methods: {
    // Получение информации о записи на прием
    async fetchAppointment() {
      this.loading = true;
      this.error = null;

      try {
        const response = await AdminAppointmentService.getAppointment(this.$route.params.id);

        if (response.status === 'success') {
          this.appointment = response.data.appointment;

          // Загружаем дополнительную информацию
          await Promise.all([
            this.fetchPatientDetails(),
            this.fetchDoctorDetails(),
            this.fetchScheduleDetails()
          ]);
        } else {
          this.error = response.message || 'Ошибка при получении информации о записи на прием';
        }
      } catch (error) {
        console.error('Ошибка при получении записи на прием:', error);
        this.error = 'Не удалось загрузить информацию о записи на прием. Пожалуйста, попробуйте позже.';
      } finally {
        this.loading = false;
      }
    },

    // Получение дополнительной информации о пациенте
    async fetchPatientDetails() {
      try {
        if (!this.appointment.pid) return;

        const response = await AdminPatientService.getPatient(this.appointment.pid);

        if (response.status === 'success') {
          this.patientDetails = response.data.patient;
        }
      } catch (error) {
        console.error('Ошибка при получении информации о пациенте:', error);
      }
    },

    // Получение дополнительной информации о враче
    async fetchDoctorDetails() {
      try {
        if (!this.appointment.docid) return;

        const response = await AdminDoctorService.getDoctor(this.appointment.docid);

        if (response.status === 'success') {
          this.doctorDetails = response.data.doctor;
        }
      } catch (error) {
        console.error('Ошибка при получении информации о враче:', error);
      }
    },

    // Получение дополнительной информации о расписании
    async fetchScheduleDetails() {
      try {
        if (!this.appointment.scheduleid) return;

        const response = await AdminScheduleService.getSchedule(this.appointment.scheduleid);

        if (response.status === 'success') {
          this.scheduleDetails = response.data.schedule;
        }
      } catch (error) {
        console.error('Ошибка при получении информации о расписании:', error);
      }
    },

    // Подтверждение отмены записи
    confirmCancelAppointment() {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите отменить запись пациента ${this.appointment.pname} на ${this.formatDate(this.appointment.scheduledate)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, отменить',
        cancelButtonText: 'Нет, оставить'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cancelAppointment();
        }
      });
    },

    // Отмена записи
    async cancelAppointment() {
      this.cancelInProgress = true;

      try {
        const response = await AdminAppointmentService.cancelAppointment(this.appointment.appoid);

        if (response.status === 'success') {
          // Показываем уведомление об успешной отмене
          this.$swal({
            title: 'Отменено!',
            text: 'Запись на прием успешно отменена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          // Перенаправляем на список записей
          this.$router.push('/admin/appointments');
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось отменить запись',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Ошибка при отмене записи:', error);
        let errorMessage = 'Не удалось отменить запись. Пожалуйста, попробуйте позже.';

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        });
      } finally {
        this.cancelInProgress = false;
      }
    },

    // Проверка, является ли запись предстоящей
    isUpcoming(dateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const appointmentDate = new Date(dateString);
      appointmentDate.setHours(0, 0, 0, 0);

      return appointmentDate >= today;
    },

    // Проверка, является ли запись на сегодня
    isToday(dateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const appointmentDate = new Date(dateString);
      appointmentDate.setHours(0, 0, 0, 0);

      return appointmentDate.getTime() === today.getTime();
    },

    // Форматирование даты
    formatDate(dateString) {
      return dateString ? this.$moment(dateString).format('DD.MM.YYYY') : 'Не указана';
    },

    // Форматирование времени
    formatTime(timeString) {
      return timeString ? timeString.substring(0, 5) : 'Не указано';
    }
  }
}
</script>

<style scoped>
.appointment-detail-page {
  margin-bottom: 2rem;
}
</style>