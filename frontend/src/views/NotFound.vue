<template>
  <div class="not-found text-center">
    <h1 class="display-1">404</h1>
    <h2>Страница не найдена</h2>
    <p>Извините, но страница, которую вы ищете, не существует.</p>
    <router-link to="/" class="btn btn-primary">Вернуться на главную</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  margin-top: 5rem;
}

.display-1 {
  font-size: 6rem;
  color: #dc3545;
}
</style>