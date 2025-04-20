<template>
  <div class="specialties-page">
    <h1>Управление специальностями</h1>

    <!-- Форма для добавления новой специальности -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">{{ editMode ? 'Редактирование специальности' : 'Добавление новой специальности' }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveSpecialty">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="specialty-name" class="form-label">Название специальности</label>
              <input
                type="text"
                class="form-control"
                id="specialty-name"
                v-model="specialtyData.name"
                required
                placeholder="Введите название специальности"
              >
            </div>
            <div class="col-md-6 d-flex align-items-end mb-3">
              <button
                type="submit"
                class="btn btn-primary me-2"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ editMode ? 'Сохранить изменения' : 'Добавить специальность' }}
              </button>
              <button
                v-if="editMode"
                type="button"
                class="btn btn-secondary"
                @click="cancelEdit"
              >
                Отмена
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Список специальностей -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Список специальностей</h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <p class="mt-2">Загрузка специальностей...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else-if="specialties.length === 0" class="alert alert-info">
          Специальности не найдены. Добавьте первую специальность с помощью формы выше.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="specialty in specialties" :key="specialty.id">
                <td>{{ specialty.id }}</td>
                <td>{{ specialty.sname }}</td>
                <td>
                  <button
                    class="btn btn-sm btn-primary me-2"
                    @click="editSpecialty(specialty)"
                  >
                    Редактировать
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="confirmDeleteSpecialty(specialty)"
                    :disabled="deleteInProgress"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSpecialtyService from '@/services/admin-specialty.service'

export default {
  name: 'AdminSpecialties',
  data() {
    return {
      specialties: [],
      specialtyData: {
        id: null,
        name: ''
      },
      loading: false,
      error: null,
      editMode: false,
      saving: false,
      deleteInProgress: false
    }
  },
  created() {
    this.fetchSpecialties()
  },
  methods: {
    // Получение списка специальностей
    async fetchSpecialties() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminSpecialtyService.getAllSpecialties()

        if (response.status === 'success') {
          this.specialties = response.data.specialties
        } else {
          this.error = response.message || 'Ошибка при получении специальностей'
        }
      } catch (error) {
        console.error('Ошибка при получении специальностей:', error)
        this.error = 'Не удалось загрузить список специальностей. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Режим редактирования специальности
    editSpecialty(specialty) {
      this.editMode = true
      this.specialtyData = {
        id: specialty.id,
        name: specialty.sname
      }
    },

    // Отмена редактирования
    cancelEdit() {
      this.editMode = false
      this.specialtyData = {
        id: null,
        name: ''
      }
    },

    // Сохранение специальности (создание или обновление)
    async saveSpecialty() {
      this.saving = true

      try {
        let response

        if (this.editMode) {
          // Обновление существующей специальности
          response = await AdminSpecialtyService.updateSpecialty(
            this.specialtyData.id,
            this.specialtyData.name
          )
        } else {
          // Создание новой специальности
          response = await AdminSpecialtyService.createSpecialty(
            this.specialtyData.name
          )
        }

        if (response.status === 'success') {
          // Показываем уведомление об успешном сохранении
          this.$swal({
            title: 'Успешно!',
            text: this.editMode
              ? 'Специальность обновлена'
              : 'Специальность добавлена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список специальностей
          this.fetchSpecialties()

          // Сбрасываем форму
          this.cancelEdit()
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось сохранить специальность',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при сохранении специальности:', error)
        let errorMessage = 'Не удалось сохранить специальность. Пожалуйста, попробуйте позже.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        })
      } finally {
        this.saving = false
      }
    },

    // Подтверждение удаления специальности
    confirmDeleteSpecialty(specialty) {
      this.$swal({
        title: 'Вы уверены?',
        text: `Вы действительно хотите удалить специальность "${specialty.sname}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteSpecialty(specialty.id)
        }
      })
    },

    // Удаление специальности
    async deleteSpecialty(id) {
      this.deleteInProgress = true

      try {
        const response = await AdminSpecialtyService.deleteSpecialty(id)

        if (response.status === 'success') {
          // Показываем уведомление об успешном удалении
          this.$swal({
            title: 'Удалено!',
            text: 'Специальность успешно удалена',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Обновляем список специальностей
          this.fetchSpecialties()

          // Если мы удалили специальность, которую сейчас редактируем, сбрасываем форму
          if (this.editMode && this.specialtyData.id === id) {
            this.cancelEdit()
          }
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось удалить специальность',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при удалении специальности:', error)
        let errorMessage = 'Не удалось удалить специальность. Пожалуйста, попробуйте позже.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage
        }

        this.$swal({
          title: 'Ошибка',
          text: errorMessage,
          icon: 'error'
        })
      } finally {
        this.deleteInProgress = false
      }
    }
  }
}
</script>