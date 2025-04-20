<template>
  <div class="appointments-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Управление записями на прием</h1>
      <router-link to="/admin/appointments/create" class="btn btn-primary">
        Создать новую запись
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="doctor-filter" class="form-label">Врач</label>
            <select
              class="form-select"
              id="doctor-filter"
              v-model="doctorFilter"
              @change="filterAppointments"
            >
              <option value="">Все врачи</option>
              <option
                v-for="doctor in doctors"
                :key="doctor.docid"
                :value="doctor.docid"
              >
                {{ doctor.docname }}
              </option>
            </select>
          </div>
          <div class="col-md-4 mb-3">
            <label for="date-filter" class="form-label">Дата</label>
            <input
              type="date"
              class="form-control"
              id="date-filter"
              v-model="dateFilter"
              @change="filterAppointments"
            >
          </div>
          <div class="col-md-4 mb-3">
            <label for="status-filter" class="form-label">Статус</label>
            <select class="form-select" id="status-filter" v-model="statusFilter" @change="filterAppointments">
              <option value="all">Все записи</option>
              <option value="upcoming">Предстоящие</option>
              <option value="today">Сегодня</option>
              <option value="past">Прошедшие</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="patient-search" class="form-label">Поиск пациента</label>
            <input
              type="text"
              class="form-control"
              id="patient-search"
              v-model="patientSearch"
              placeholder="ФИО или Email пациента"
              @input="filterAppointments"
            >
          </div>
          <div class="col-md-4 d-flex align-items-end mb-3">
            <button
              class="btn btn-secondary"
              @click="resetFilters"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика записей -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Статистика записей</h5>
      </div>
      <div class="card-body">
        <div v-if="loadingStats" class="text-center">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Загрузка статистики...
        </div>
        <div v-else class="row">
          <div class="col-md-3 mb-3">
            <div class="card bg-light">
              <div class="card-body text-center">
                <h5 class="card-title">Всего записей</h5>
                <h3>{{ stats.total }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h5 class="card-title">Сегодня</h5>
                <h3>{{ stats.today }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5 class="card-title">Предстоящие</h5>
                <h3>{{ stats.upcoming }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-secondary text-white">
              <div class="card-body text-center">
                <h5 class="card-title">Прошедшие</h5>
                <h3>{{ stats.past }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Список записей -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка записей на прием...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="filteredAppointments.length === 0" class="alert alert-info">
      Записи на прием не найдены.
      <span v-if="hasActiveFilters">
        Попробуйте изменить параметры фильтрации.
      </span>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата и время</th>
            <th>Пациент</th>
            <th>Врач</th>
            <th>Услуга</th>
            <th>№ очереди</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in filteredAppointments" :key="appointment.appoid">
            <td>{{ appointment.appoid }}</td>
            <td>
              {{ formatDate(appointment.scheduledate) }} {{ formatTime(appointment.scheduletime) }}
            </td>
            <td>
              {{ appointment.pname }}<br>
              <small class="text-muted">{{ appointment.pemail }}</small>
            </td>
            <td>
              {{ appointment.docname }}<br>
              <small class="text-muted">{{ appointment.docemail }}</small>
            </td>
            <td>{{ appointment.title }}</td>
            <td>{{ appointment.apponum }}</td>
            <td>
              <span
                :class="isUpcoming(appointment.scheduledate) ? 'badge bg-primary' : 'badge bg-secondary'"
              >
                {{ isToday(appointment.scheduledate) ? 'Сегодня' :
                   isUpcoming(appointment.scheduledate) ? 'Предстоящий' : 'Прошедший' }}
              </span>
            </td>
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
                  v-if="isUpcoming(appointment.scheduledate)"
                  class="btn btn-sm btn-danger"
                  title="Отменить"
                  @click="confirmCancelAppointment(appointment)"
                  :disabled="cancelInProgress"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import AdminAppointmentService from '@/services/admin-appointment.service';
import AdminDoctorService from '@/services/admin-doctor.service';

export default {
  name: 'AdminAppointments',
  data() {
    return {
      appointments: [],
      doctors: [],
      doctorFilter: '',
      dateFilter: '',
      statusFilter: 'all',
      patientSearch: '',
      loading: false,
      loadingStats: false,
      error: null,
      stats: {
        total: 0,
        today: 0,
        upcoming: 0,
        past: 0
      },
      cancelInProgress: false
    }
  },
  computed: {
    // Отфильтрованный список записей
    filteredAppointments() {
      if (!this.hasActiveFilters) {
        return this.appointments;
      }

      return this.appointments.filter(appointment => {
        // Фильтр по врачу
        if (this.doctorFilter && appointment.docid != this.doctorFilter) {
          return false;
        }

        // Фильтр по дате
        if (this.dateFilter) {
          const filterDate = new Date(this.dateFilter).toISOString().split('T')[0];
          const appointmentDate = new Date(appointment.scheduledate).toISOString().split('T')[0];
          if (appointmentDate !== filterDate) {
            return false;
          }
        }

        // Фильтр по статусу
        if (this.statusFilter === 'upcoming' && !this.isUpcoming(appointment.scheduledate)) {
          return false;
        } else if (this.statusFilter === 'past' && this.isUpcoming(appointment.scheduledate)) {
          return false;
        } else if (this.statusFilter === 'today' && !this.isToday(appointment.scheduledate)) {
          return false;
        }

        // Поиск по пациенту
        if (this.patientSearch) {
          const searchTerm = this.patientSearch.toLowerCase();
          return appointment.pname.toLowerCase().includes(searchTerm) ||
                 appointment.pemail.toLowerCase().includes(searchTerm);
        }

        return true;
      });
    },

    // Проверка, есть ли активные фильтры
    hasActiveFilters() {
      return this.doctorFilter || this.dateFilter || this.statusFilter !== 'all' || this.patientSearch;
    }
  },
  created() {
    this.fetchAppointments();
    this.fetchDoctors();
    this.fetchAppointmentStats();
  },
  methods: {
    // Получение списка записей на прием
    async fetchAppointments() {
      this.loading = true;
      this.error = null;

      try {
        const response = await AdminAppointmentService.getAllAppointments();

        if (response.status === 'success') {
          this.appointments = response.data.appointments;
        } else {
          this.error = response.message || 'Ошибка при получении записей на прием';
        }
      } catch (error) {
        console.error('Ошибка при получении записей на прием:', error);
        this.error = 'Не удалось загрузить список записей на прием. Пожалуйста, попробуйте позже.';
      } finally {
        this.loading = false;
      }
    },

    // Получение списка врачей для фильтра
    async fetchDoctors() {
      try {
        const response = await AdminDoctorService.getAllDoctors();

        if (response.status === 'success') {
          this.doctors = response.data.doctors;
        }
      } catch (error) {
        console.error('Ошибка при получении врачей:', error);
      }
    },

    // Получение статистики по записям
    async fetchAppointmentStats() {
      this.loadingStats = true;

      try {
        const response = await AdminAppointmentService.getAppointmentStats();

        if (response.status === 'success') {
          this.stats = response.data;
        }
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
      } finally {
        this.loadingStats = false;
      }
    },

    // Фильтрация записей (не требуется API-запрос, т.к. используется computed property)
    filterAppointments() {
      // Фильтрация происходит автоматически через вычисляемое свойство filteredAppointments
    },

    // Сброс всех фильтров
    resetFilters() {
      this.doctorFilter = '';
      this.dateFilter = '';
      this.statusFilter = 'all';
      this.patientSearch = '';
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
          this.cancelAppointment(appointment.appoid);
        }
      });
    },

    // Отмена записи
    async cancelAppointment(id) {
      this.cancelInProgress = true;

      try {
        const response = await AdminAppointmentService.cancelAppointment(id);

        if (response.status === 'success') {
          // Показываем уведомление об успешной отмене
          this.$swal({
            title: 'Отменено!',
            text: 'Запись на прием успешно отменена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          // Обновляем списки записей и статистику
          this.fetchAppointments();
          this.fetchAppointmentStats();
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
/* Импорт Bootstrap Icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");

.appointments-page {
  margin-bottom: 2rem;
}
</style>