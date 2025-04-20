<template>
  <div class="stats-page">
    <h1>Статистика системы</h1>

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
      <!-- Общая статистика пользователей -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Статистика пользователей</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="card">
                <div class="card-body text-center">
                  <h5 class="card-title">Всего пользователей</h5>
                  <h2 class="text-primary">{{ stats.users.total }}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <div class="card bg-info text-white">
                    <div class="card-body text-center">
                      <h5 class="card-title">Пациенты</h5>
                      <h3>{{ stats.users.patients }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="card bg-success text-white">
                    <div class="card-body text-center">
                      <h5 class="card-title">Врачи</h5>
                      <h3>{{ stats.users.doctors }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="card bg-warning">
                    <div class="card-body text-center">
                      <h5 class="card-title">Администраторы</h5>
                      <h3>{{ stats.users.admins }}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика расписаний и записей -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Статистика расписаний</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <h5 class="card-title">Всего</h5>
                      <h3>{{ stats.schedules.total }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                      <h5 class="card-title">Предстоящие</h5>
                      <h3>{{ stats.schedules.upcoming }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="card bg-secondary text-white">
                    <div class="card-body text-center">
                      <h5 class="card-title">Прошедшие</h5>
                      <h3>{{ stats.schedules.past }}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Статистика записей на прием</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <h5 class="card-title">Всего</h5>
                      <h3>{{ stats.appointments.total }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-info text-white">
                    <div class="card-body text-center">
                      <h5 class="card-title">Сегодня</h5>
                      <h3>{{ stats.appointments.today }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                      <h5 class="card-title">Будущие</h5>
                      <h3>{{ stats.appointments.upcoming }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-secondary text-white">
                    <div class="card-body text-center">
                      <h5 class="card-title">Прошедшие</h5>
                      <h3>{{ stats.appointments.past }}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика по специальностям -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Распределение врачей по специальностям</h5>
        </div>
        <div class="card-body">
          <div v-if="stats.specialties.length === 0" class="text-center">
            Нет данных о специальностях
          </div>

          <div v-else class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Специальность</th>
                  <th>Количество врачей</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="specialty in stats.specialties" :key="specialty.id">
                  <td>{{ specialty.sname }}</td>
                  <td>{{ specialty.doctor_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Статистика по активности за месяц -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Активность за последний месяц</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="card bg-success text-white">
                <div class="card-body text-center">
                  <h5 class="card-title">Всего записей</h5>
                  <h3>{{ stats.monthlyActivity.appointments }}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card bg-info text-white">
                <div class="card-body text-center">
                  <h5 class="card-title">Уникальных пациентов</h5>
                  <h3>{{ stats.monthlyActivity.uniquePatients }}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card bg-primary text-white">
                <div class="card-body text-center">
                  <h5 class="card-title">Уникальных врачей</h5>
                  <h3>{{ stats.monthlyActivity.uniqueDoctors }}</h3>
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
  name: 'AdminStats',
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