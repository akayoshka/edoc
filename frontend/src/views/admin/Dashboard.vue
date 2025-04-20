<template>
  <div class="dashboard-page">
    <h1>Панель управления администратора</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка статистики...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <!-- Общая статистика -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <h5 class="card-title">Пользователи</h5>
              <h2 class="card-text">{{ stats.users.total }}</h2>
              <p>
                <span class="me-2">Пациенты: {{ stats.users.patients }}</span>
                <span class="me-2">Врачи: {{ stats.users.doctors }}</span>
                <span>Администраторы: {{ stats.users.admins }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <h5 class="card-title">Расписания</h5>
              <h2 class="card-text">{{ stats.schedules.total }}</h2>
              <p>
                <span class="me-2">Предстоящие: {{ stats.schedules.upcoming }}</span>
                <span>Прошедшие: {{ stats.schedules.past }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <h5 class="card-title">Записи на прием</h5>
              <h2 class="card-text">{{ stats.appointments.total }}</h2>
              <p>
                <span class="me-2">Сегодня: {{ stats.appointments.today }}</span>
                <span class="me-2">Предстоящие: {{ stats.appointments.upcoming }}</span>
                <span>Прошедшие: {{ stats.appointments.past }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-warning">
            <div class="card-body">
              <h5 class="card-title">Активность за месяц</h5>
              <h2 class="card-text">{{ stats.monthlyActivity.appointments }}</h2>
              <p>
                <span class="me-2">Уникальных пациентов: {{ stats.monthlyActivity.uniquePatients }}</span>
                <span>Уникальных врачей: {{ stats.monthlyActivity.uniqueDoctors }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Быстрый доступ к функциям -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Быстрые действия</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link to="/admin/doctors/create" class="btn btn-primary">
                  Добавить нового врача
                </router-link>
                <router-link to="/admin/patients/create" class="btn btn-success">
                  Добавить нового пациента
                </router-link>
                <router-link to="/admin/schedules/create" class="btn btn-info">
                  Создать новое расписание
                </router-link>
                <router-link to="/admin/appointments/create" class="btn btn-warning">
                  Создать новую запись на прием
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <!-- Статистика по специальностям -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Специальности врачей</h5>
            </div>
            <div class="card-body">
              <div v-if="stats.specialties.length === 0" class="text-center">
                Нет данных о специальностях
              </div>

              <div v-else class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Специальность</th>
                      <th>Количество врачей</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="specialty in stats.specialties.slice(0, 5)" :key="specialty.id">
                      <td>{{ specialty.sname }}</td>
                      <td>{{ specialty.doctor_count }}</td>
                    </tr>
                  </tbody>
                </table>

                <div v-if="stats.specialties.length > 5" class="text-center">
                  <router-link to="/admin/specialties">Показать все...</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminStatsService from '@/services/admin-stats.service'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      stats: {
        users: { total: 0, patients: 0, doctors: 0, admins: 0 },
        schedules: { total: 0, upcoming: 0, past: 0 },
        appointments: { total: 0, today: 0, upcoming: 0, past: 0 },
        specialties: [],
        monthlyActivity: { appointments: 0, uniquePatients: 0, uniqueDoctors: 0 }
      },
      loading: false,
      error: null
    }
  },
  created() {
    this.fetchStats()
  },
  methods: {
    // Получение статистики
    async fetchStats() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminStatsService.getSystemStats()

        if (response.status === 'success') {
          this.stats = response.data
        } else {
          this.error = response.message || 'Ошибка при получении статистики'
        }
      } catch (error) {
        console.error('Ошибка при получении статистики:', error)
        this.error = 'Не удалось загрузить статистику. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>