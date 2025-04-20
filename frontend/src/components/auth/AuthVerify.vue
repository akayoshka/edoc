<template>
  <div class="auth-verify">
    <!-- Компонент не имеет UI, только логика -->
  </div>
</template>

<script>
import AuthService from '@/services/auth.service'

export default {
  name: 'AuthVerify',
  async created() {
    // Проверяем состояние аутентификации при загрузке компонента
    if (this.$store.getters.isAuthenticated) {
      try {
        const response = await AuthService.getCurrentUser()
        if (response.status === 'success') {
          // Обновляем данные пользователя в хранилище
          this.$store.dispatch('login', {
            token: this.$store.getters.token,
            user: response.data.user
          })
        } else {
          this.$store.dispatch('logout')
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error)
        // В случае ошибки выходим из системы
        this.$store.dispatch('logout')
        this.$router.push('/login')
      }
    }
  }
}
</script>