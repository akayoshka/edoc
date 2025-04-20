<template>
  <div class="patient-dashboard">
    <h1>Панель управления пациента</h1>
    <div class="alert alert-info">
      Добро пожаловать, {{ user ? user.name || user.email : 'Пациент' }}!
    </div>

    <div class="row mt-4">
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Мои записи</h5>
            <p class="card-text">Здесь вы можете просмотреть ваши текущие и прошедшие записи к врачам.</p>
            <router-link to="/patient/appointments" class="btn btn-primary">Просмотр записей</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Новая запись</h5>
            <p class="card-text">Запишитесь на прием к любому врачу из нашего каталога.</p>
            <router-link to="/patient/doctors" class="btn btn-primary">Выбрать врача</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Мой профиль</h5>
            <p class="card-text">Здесь вы можете просмотреть и изменить ваши личные данные.</p>
            <router-link to="/patient/profile" class="btn btn-primary">Перейти к профилю</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PatientDashboard',
  computed: {
    ...mapGetters(['user'])
  }
}
</script>