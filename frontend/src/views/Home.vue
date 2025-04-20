<template>
  <div class="home">
    <div class="jumbotron text-center">
      <h1 class="display-4">Добро пожаловать в eDoc</h1>
      <p class="lead">Удобная система записи к врачам</p>
      <hr class="my-4">
      <p>Войдите или зарегистрируйтесь, чтобы начать работу с системой</p>
      <router-link to="/login" class="btn btn-primary btn-lg me-2">Вход</router-link>
      <router-link to="/register" class="btn btn-outline-primary btn-lg">Регистрация</router-link>
    </div>

    <div class="row mt-5">
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body text-center">
            <h3 class="card-title">Для пациентов</h3>
            <p class="card-text">Удобная запись к врачам по различным специальностям</p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body text-center">
            <h3 class="card-title">Для врачей</h3>
            <p class="card-text">Управление расписанием и просмотр записей пациентов</p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body text-center">
            <h3 class="card-title">Для администраторов</h3>
            <p class="card-text">Полный контроль над системой и всеми пользователями</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.jumbotron {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 0.3rem;
  margin-bottom: 2rem;
}
</style>