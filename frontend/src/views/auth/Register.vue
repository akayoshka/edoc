<template>
  <div class="register-page">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="my-0">Регистрация пациента</h4>
          </div>
          <div class="card-body">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleRegister">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="name" class="form-label">ФИО</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    v-model="userData.name"
                    required
                    placeholder="Введите ваше ФИО"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="userData.email"
                    required
                    placeholder="Введите email"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="password" class="form-label">Пароль</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="userData.password"
                    required
                    placeholder="Введите пароль"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="confirm-password" class="form-label">Подтверждение пароля</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirm-password"
                    v-model="confirmPassword"
                    required
                    placeholder="Подтвердите пароль"
                    :class="{ 'is-invalid': confirmPassword && !passwordsMatch }"
                  >
                  <div class="invalid-feedback">
                    Пароли не совпадают
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="nic" class="form-label">Паспорт/ID</label>
                  <input
                    type="text"
                    class="form-control"
                    id="nic"
                    v-model="userData.nic"
                    placeholder="Введите номер паспорта/ID"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="dob" class="form-label">Дата рождения</label>
                  <input
                    type="date"
                    class="form-control"
                    id="dob"
                    v-model="userData.dob"
                    required
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="tel" class="form-label">Телефон</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="tel"
                    v-model="userData.tel"
                    placeholder="Введите номер телефона"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="address" class="form-label">Адрес</label>
                  <input
                    type="text"
                    class="form-control"
                    id="address"
                    v-model="userData.address"
                    placeholder="Введите адрес"
                  >
                </div>
              </div>

              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading || !canRegister"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Зарегистрироваться
                </button>
              </div>
            </form>

            <div class="mt-3 text-center">
              <p>Уже есть учетная запись? <router-link to="/login">Войти</router-link></p>
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
  name: 'RegisterView',
  data() {
    return {
      userData: {
        name: '',
        email: '',
        password: '',
        nic: '',
        dob: '',
        tel: '',
        address: ''
      },
      confirmPassword: '',
      loading: false,
      errorMessage: ''
    }
  },
  computed: {
    passwordsMatch() {
      return this.userData.password === this.confirmPassword
    },
    canRegister() {
      return (
        this.userData.name &&
        this.userData.email &&
        this.userData.password &&
        this.userData.dob &&
        this.passwordsMatch
      )
    }
  },
  methods: {
    async handleRegister() {
      if (!this.passwordsMatch) {
        this.errorMessage = 'Пароли не совпадают'
        return
      }

      this.loading = true
      this.errorMessage = ''

      try {
        const response = await AuthService.registerPatient(this.userData)

        if (response.status === 'success') {
          // Сохраняем данные авторизации
          this.$store.dispatch('login', {
            token: response.data.token,
            user: response.data.user
          })

          // Перенаправляем пользователя на панель управления пациента
          this.$router.push('/patient')

          // Показываем уведомление об успешной регистрации
          this.$swal({
            title: 'Успешно!',
            text: 'Вы успешно зарегистрировались',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })
        } else {
          this.errorMessage = response.message || 'Ошибка при регистрации'
        }
      } catch (error) {
        console.error('Ошибка при регистрации:', error)
        if (error.response) {
          this.errorMessage = error.response.data.message || 'Ошибка при регистрации'
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
.register-page {
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>