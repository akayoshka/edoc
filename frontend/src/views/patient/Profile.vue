<template>
  <div class="profile-page">
    <h1>Мой профиль</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка профиля...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <!-- Личная информация -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Личная информация</h5>
          <button
            class="btn btn-primary btn-sm"
            @click="editMode = !editMode"
          >
            {{ editMode ? 'Отменить' : 'Редактировать' }}
          </button>
        </div>
        <div class="card-body">
          <form v-if="editMode" @submit.prevent="updateProfile">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="name" class="form-label">ФИО</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="profileData.name"
                  required
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="profileData.email"
                  disabled
                >
                <small class="text-muted">Email нельзя изменить</small>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="nic" class="form-label">Паспорт/ID</label>
                <input
                  type="text"
                  class="form-control"
                  id="nic"
                  v-model="profileData.nic"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="dob" class="form-label">Дата рождения</label>
                <input
                  type="date"
                  class="form-control"
                  id="dob"
                  v-model="profileData.dob"
                  disabled
                >
                <small class="text-muted">Дату рождения нельзя изменить</small>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="tel" class="form-label">Телефон</label>
                <input
                  type="tel"
                  class="form-control"
                  id="tel"
                  v-model="profileData.tel"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="address" class="form-label">Адрес</label>
                <input
                  type="text"
                  class="form-control"
                  id="address"
                  v-model="profileData.address"
                >
              </div>
            </div>

            <div class="d-flex">
              <button
                type="submit"
                class="btn btn-success"
                :disabled="updating"
              >
                <span v-if="updating" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Сохранить изменения
              </button>
              <button
                type="button"
                class="btn btn-secondary ms-2"
                @click="cancelEdit"
              >
                Отмена
              </button>
            </div>
          </form>

          <div v-else>
            <div class="row">
              <div class="col-md-6">
                <p><strong>ФИО:</strong> {{ profileData.name }}</p>
                <p><strong>Email:</strong> {{ profileData.email }}</p>
                <p><strong>Паспорт/ID:</strong> {{ profileData.nic || 'Не указан' }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Дата рождения:</strong> {{ formatDate(profileData.dob) }}</p>
                <p><strong>Телефон:</strong> {{ profileData.tel || 'Не указан' }}</p>
                <p><strong>Адрес:</strong> {{ profileData.address || 'Не указан' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Смена пароля -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Смена пароля</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="changePassword">
            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="current-password" class="form-label">Текущий пароль</label>
                <input
                  type="password"
                  class="form-control"
                  id="current-password"
                  v-model="passwordData.currentPassword"
                  required
                >
              </div>
              <div class="col-md-4 mb-3">
                <label for="new-password" class="form-label">Новый пароль</label>
                <input
                  type="password"
                  class="form-control"
                  id="new-password"
                  v-model="passwordData.newPassword"
                  required
                >
              </div>
              <div class="col-md-4 mb-3">
                <label for="confirm-password" class="form-label">Подтвердите пароль</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirm-password"
                  v-model="passwordData.confirmPassword"
                  required
                  :class="{ 'is-invalid': passwordData.confirmPassword && !passwordsMatch }"
                >
                <div class="invalid-feedback">
                  Пароли не совпадают
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="changingPassword || !passwordsMatch"
            >
              <span v-if="changingPassword" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Изменить пароль
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PatientService from '@/services/patient.service'

export default {
  name: 'PatientProfile',
  data() {
    return {
      profileData: {
        name: '',
        email: '',
        nic: '',
        dob: '',
        tel: '',
        address: ''
      },
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      originalProfileData: {},
      loading: false,
      error: null,
      editMode: false,
      updating: false,
      changingPassword: false
    }
  },
  computed: {
    passwordsMatch() {
      return this.passwordData.newPassword === this.passwordData.confirmPassword
    }
  },
  created() {
    this.fetchProfile()
  },
  methods: {
    // Получение профиля
    async fetchProfile() {
      this.loading = true
      this.error = null

      try {
        const response = await PatientService.getProfile()

        if (response.status === 'success') {
          this.profileData = response.data.patient
          this.originalProfileData = { ...response.data.patient }
        } else {
          this.error = response.message || 'Ошибка при получении профиля'
        }
      } catch (error) {
        console.error('Ошибка при получении профиля:', error)
        this.error = 'Не удалось загрузить профиль. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Отмена редактирования профиля
    cancelEdit() {
      this.profileData = { ...this.originalProfileData }
      this.editMode = false
    },

    // Обновление профиля
    async updateProfile() {
      this.updating = true

      try {
        const response = await PatientService.updateProfile({
          name: this.profileData.name,
          address: this.profileData.address,
          nic: this.profileData.nic,
          tel: this.profileData.tel
        })

        if (response.status === 'success') {
          // Показываем уведомление об успешном обновлении
          this.$swal({
            title: 'Успешно!',
            text: 'Ваш профиль был обновлен',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем оригинальные данные и выходим из режима редактирования
          this.originalProfileData = { ...this.profileData }
          this.editMode = false

          // Обновляем данные пользователя в хранилище
          this.$store.dispatch('login', {
            token: this.$store.getters.token,
            user: {
              ...this.$store.getters.user,
              name: this.profileData.name
            }
          })
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось обновить профиль',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error)
        let errorMessage = 'Не удалось обновить профиль. Пожалуйста, попробуйте позже.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        })
      } finally {
        this.updating = false
      }
    },

    // Изменение пароля
    async changePassword() {
      if (!this.passwordsMatch) {
        this.$swal({
          title: 'Ошибка',
          text: 'Пароли не совпадают',
          icon: 'error'
        })
        return
      }

      this.changingPassword = true

      try {
        const response = await PatientService.changePassword(this.passwordData)

        if (response.status === 'success') {
          // Показываем уведомление об успешном изменении пароля
          this.$swal({
            title: 'Успешно!',
            text: 'Ваш пароль был изменен',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Очищаем форму
          this.passwordData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось изменить пароль',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при изменении пароля:', error)
        let errorMessage = 'Не удалось изменить пароль. Пожалуйста, попробуйте позже.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        })
      } finally {
        this.changingPassword = false
      }
    },

    // Форматирование даты
    formatDate(dateString) {
      return this.$moment(dateString).format('DD.MM.YYYY')
    }
  }
}
</script>