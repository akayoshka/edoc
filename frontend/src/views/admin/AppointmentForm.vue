<template>
  <div class="appointment-form-page">
    <h1>Создание новой записи на прием</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка данных...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="createAppointment">
            <!-- Выбор пациента -->
            <div class="mb-4">
              <label for="patient" class="form-label">Пациент</label>
              <div class="row">
                <div class="col-md-9 mb-3">
                  <select
                    class="form-select"
                    id="patient"
                    v-model="appointmentData.patientId"
                    required
                  >
                    <option value="" disabled selected>Выберите пациента</option>
                    <option
                      v-for="patient in patients"
                      :key="patient.pid"
                      :value="patient.pid"
                    >
                      {{ patient.pname }} ({{ patient.pemail }})
                    </option>
                  </select>
                </div>
                <div class="col-md-3 mb-3">
                  <button
                    type="button"
                    class="btn btn-outline-primary w-100"
                    @click="showPatientSearch = !showPatientSearch"
                  >
                    {{ showPatientSearch ? 'Скрыть поиск' : 'Поиск пациента' }}
                  </button>
                </div>
              </div>

              <!-- Поиск пациента -->
              <div v-if="showPatientSearch" class="card mb-3">
                <div class="card-body">
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Введите имя или email пациента"
                      v-model="patientSearch"
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="patientSearch = ''"
                    >
                      Очистить
                    </button>
                  </div>

                  <div v-if="patientSearch && filteredPatients.length === 0" class="alert alert-info">
                    Пациенты не найдены. Проверьте правильность поискового запроса.
                  </div>

                  <div v-if="patientSearch && filteredPatients.length > 0" class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>ФИО</th>
                          <th>Email</th>
                          <th>Телефон</th>
                          <th>Действие</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="patient in filteredPatients" :key="patient.pid">
                          <td>{{ patient.pname }}</td>
                          <td>{{ patient.pemail }}</td>
                          <td>{{ patient.ptel || 'Не указан' }}</td>
                          <td>
                            <button
                              type="button"
                              class="btn btn-sm btn-primary"
                              @click="selectPatient(patient.pid)"
                            >
                              Выбрать
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Выбор врача и расписания -->
            <div class="mb-4">
              <label for="doctor" class="form-label">Врач</label>
              <select
                class="form-select mb-3"
                id="doctor"
                v-model="selectedDoctorId"
                required
                @change="fetchDoctorSchedules"
              >
                <option value="" disabled selected>Выберите врача</option>
                <option
                  v-for="doctor in doctors"
                  :key="doctor.docid"
                  :value="doctor.docid"
                >
                  {{ doctor.docname }} ({{ doctor.specialty_name }})
                </option>
              </select>

              <div v-if="selectedDoctorId && !loadingSchedules">
                <label for="schedule" class="form-label">Расписание</label>
                <select
                  class="form-select"
                  id="schedule"
                  v-model="appointmentData.scheduleId"
                  required
                >
                  <option value="" disabled selected>Выберите расписание</option>
                  <option
                    v-for="schedule in availableSchedules"
                    :key="schedule.scheduleid"
                    :value="schedule.scheduleid"
                    :disabled="schedule.availableSlots <= 0"
                  >
                    {{ formatDate(schedule.scheduledate) }} {{ formatTime(schedule.scheduletime) }} -
                    {{ schedule.title }} ({{ schedule.availableSlots }} из {{ schedule.nop }} мест)
                  </option>
                </select>

                <div v-if="availableSchedules.length === 0" class="alert alert-warning mt-3">
                  У выбранного врача нет доступных расписаний. Выберите другого врача или создайте новое расписание.
                </div>
              </div>

              <div v-if="selectedDoctorId && loadingSchedules" class="text-center mt-3">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Загрузка расписаний...
              </div>
            </div>

            <div class="d-flex">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="creating || !isFormValid"
              >
                <span v-if="creating" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Создать запись
              </button>
              <router-link to="/admin/appointments" class="btn btn-secondary ms-2">
                Отмена
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminAppointmentService from '@/services/admin-appointment.service';
import AdminDoctorService from '@/services/admin-doctor.service';
import AdminPatientService from '@/services/admin-patient.service';
import AdminScheduleService from '@/services/admin-schedule.service';

export default {
  name: 'AdminAppointmentForm',
  data() {
    return {
      appointmentData: {
        patientId: '',
        scheduleId: ''
      },
      patients: [],
      doctors: [],
      availableSchedules: [],
      selectedDoctorId: '',
      patientSearch: '',
      showPatientSearch: false,
      loading: false,
      loadingSchedules: false,
      creating: false,
      error: null
    }
  },
  computed: {
    // Отфильтрованный список пациентов для поиска
    filteredPatients() {
      if (!this.patientSearch) return [];

      const searchTerm = this.patientSearch.toLowerCase();
      return this.patients.filter(patient =>
        patient.pname.toLowerCase().includes(searchTerm) ||
        patient.pemail.toLowerCase().includes(searchTerm)
      );
    },

    // Проверка валидности формы
    isFormValid() {
      return this.appointmentData.patientId && this.appointmentData.scheduleId;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    // Загрузка данных для формы
    async fetchData() {
      this.loading = true;
      this.error = null;

      try {
        // Загрузка списка пациентов
        const patientsResponse = await AdminPatientService.getAllPatients();
        if (patientsResponse.status === 'success') {
          this.patients = patientsResponse.data.patients;
        } else {
          this.error = 'Ошибка при получении списка пациентов';
          return;
        }

        // Загрузка списка врачей
        const doctorsResponse = await AdminDoctorService.getAllDoctors();
        if (doctorsResponse.status === 'success') {
          this.doctors = doctorsResponse.data.doctors;
        } else {
          this.error = 'Ошибка при получении списка врачей';
          return;
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        this.error = 'Не удалось загрузить необходимые данные. Пожалуйста, попробуйте позже.';
      } finally {
        this.loading = false;
      }
    },

    // Загрузка расписаний выбранного врача
    async fetchDoctorSchedules() {
      if (!this.selectedDoctorId) return;

      this.loadingSchedules = true;
      this.appointmentData.scheduleId = '';

      try {
        const response = await AdminScheduleService.getAllSchedules();

        if (response.status === 'success') {
          // Фильтруем расписания по выбранному врачу и только будущие с доступными местами
          this.availableSchedules = response.data.schedules.filter(schedule => {
            const scheduleDateObj = new Date(schedule.scheduledate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return schedule.docid == this.selectedDoctorId &&
                   scheduleDateObj >= today &&
                   schedule.availableSlots > 0;
          });
        } else {
          console.error('Ошибка при получении расписаний:', response.message);
        }
      } catch (error) {
        console.error('Ошибка при получении расписаний врача:', error);
      } finally {
        this.loadingSchedules = false;
      }
    },

    // Выбор пациента из результатов поиска
    selectPatient(patientId) {
      this.appointmentData.patientId = patientId;
      this.showPatientSearch = false;
      this.patientSearch = '';
    },

    // Создание записи на прием
    async createAppointment() {
      if (!this.isFormValid) return;

      this.creating = true;

      try {
        const response = await AdminAppointmentService.createAppointment({
          patientId: this.appointmentData.patientId,
          scheduleId: this.appointmentData.scheduleId
        });

        if (response.status === 'success') {
          // Показываем уведомление об успешном создании
          this.$swal({
            title: 'Успешно!',
            text: 'Запись на прием успешно создана',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          // Перенаправляем на страницу записей
          this.$router.push('/admin/appointments');
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось создать запись на прием',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Ошибка при создании записи на прием:', error);
        let errorMessage = 'Не удалось создать запись на прием. Пожалуйста, попробуйте позже.';

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        });
      } finally {
        this.creating = false;
      }
    },

    // Форматирование даты
    formatDate(dateString) {
      return this.$moment(dateString).format('DD.MM.YYYY');
    },

    // Форматирование времени
    formatTime(timeString) {
      return timeString ? timeString.substring(0, 5) : '';
    }
  }
}
</script>

<style scoped>
.appointment-form-page {
  margin-bottom: 2rem;
}
</style>