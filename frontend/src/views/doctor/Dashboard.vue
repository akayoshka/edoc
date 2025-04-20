<template>
  <div class="doctor-dashboard">
    <h1>Панель управления врача</h1>
    <div class="alert alert-info">
      Добро пожаловать, {{ user ? user.name || user.email : 'Доктор' }}!
    </div>

    <div class="row mt-4">
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Записи пациентов</h5>
            <p class="card-text">Просмотр всех записей пациентов к вам на прием.</p>
            <router-link to="/doctor/appointments" class="btn btn-primary">Просмотр записей</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Управление расписанием</h5>
            <p class="card-text">Создание и управление вашим расписанием приемов.</p>
            <router-link to="/doctor/schedules" class="btn btn-primary">Расписание</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Мой профиль</h5>
            <p class="card-text">Просмотр и изменение ваших личных данных.</p>
            <router-link to="/doctor/profile" class="btn btn-primary">Перейти к профилю</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DoctorDashboard',
  computed: {
    ...mapGetters(['user'])
  }
}
</script>