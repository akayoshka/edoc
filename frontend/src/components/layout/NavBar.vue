<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link class="navbar-brand" to="/">eDoc</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- Меню для пациентов -->
          <template v-if="userType === 'p'">
            <li class="nav-item">
              <router-link class="nav-link" to="/patient">Панель управления</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/patient/appointments">Мои записи</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/patient/doctors">Врачи</router-link>
            </li>
          </template>

          <!-- Меню для врачей -->
          <template v-if="userType === 'd'">
            <li class="nav-item">
              <router-link class="nav-link" to="/doctor">Панель управления</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/doctor/appointments">Записи пациентов</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/doctor/schedules">Мое расписание</router-link>
            </li>
          </template>

          <!-- Меню для администраторов -->
          <template v-if="userType === 'a'">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin">Панель управления</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/doctors">Врачи</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/patients">Пациенты</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/schedules">Расписания</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/appointments">Записи</router-link>
            </li>
          </template>
        </ul>

        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
              {{ user ? user.name || user.email : 'Пользователь' }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li v-if="userType === 'p'">
                <router-link class="dropdown-item" to="/patient/profile">Мой профиль</router-link>
              </li>
              <li v-if="userType === 'd'">
                <router-link class="dropdown-item" to="/doctor/profile">Мой профиль</router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout">Выход</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'NavBar',
  computed: {
    ...mapGetters(['user', 'userType'])
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>