<template>
  <div class="login-page">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="my-0">Вход в систему</h4>
          </div>
          <div class="card-body">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  required
                  placeholder="Введите email"
                >
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                  placeholder="Введите пароль"
                >
              </div>
              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Войти
                </button>
              </div>
            </form>

            <div class="mt-3 text-center">
              <p>Нет учетной записи? <router-link to="/register">Зарегистрироваться</router-link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await AuthService.login(this.email, this.password)

        if (response.status === 'success') {
          // Сохраняем данные авторизации
          this.$store.dispatch('login', {
            token: response.data.token,
            user: response.data.user
          })

          // Перенаправляем пользователя на соответствующую страницу
          const userType = response.data.user.userType
          if (userType === 'p') {
            this.$router.push('/patient')
          } else if (userType === 'd') {
            this.$router.push('/doctor')
          } else if (userType === 'a') {
            this.$router.push('/admin')
          } else {
            this.$router.push('/')
          }

          // Показываем уведомление об успешном входе
          this.$swal({
            title: 'Успешно!',
            text: 'Вы вошли в систему',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })
        } else {
          this.errorMessage = response.message || 'Ошибка при входе'
        }
      } catch (error) {
        console.error('Ошибка при входе:', error)
        if (error.response) {
          this.errorMessage = error.response.data.message || 'Неверный email или пароль'
        } else {
          this.errorMessage = 'Ошибка сети. Пожалуйста, проверьте подключение к интернету.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  margin-top: 2rem;
}
</style>