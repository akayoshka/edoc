<template>
  <div class="doctor-form-page">
    <h1>{{ isEdit ? 'Редактирование' : 'Добавление' }} врача</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mt-2">Загрузка данных...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="saveDoctor">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="name" class="form-label">ФИО</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="doctorData.name"
                  required
                  placeholder="Введите ФИО врача"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="doctorData.email"
                  required
                  placeholder="Введите email врача"
                  :disabled="isEdit"
                >
                <div v-if="isEdit" class="form-text text-muted">
                  Email нельзя изменить
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="doctorData.password"
                  :required="!isEdit"
                  placeholder="Введите пароль"
                >
                <div v-if="isEdit" class="form-text text-muted">
                  Оставьте пустым, чтобы не менять пароль
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label for="specialty" class="form-label">Специальность</label>
                <select
                  class="form-select"
                  id="specialty"
                  v-model="doctorData.specialtyId"
                  required
                >
                  <option value="" disabled>Выберите специальность</option>
                  <option
                    v-for="specialty in specialties"
                    :key="specialty.id"
                    :value="specialty.id"
                  >
                    {{ specialty.sname }}
                  </option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="nic" class="form-label">Паспорт/ID</label>
                <input
                  type="text"
                  class="form-control"
                  id="nic"
                  v-model="doctorData.nic"
                  placeholder="Введите номер паспорта/ID"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="tel" class="form-label">Телефон</label>
                <input
                  type="tel"
                  class="form-control"
                  id="tel"
                  v-model="doctorData.tel"
                  placeholder="Введите номер телефона"
                >
              </div>
            </div>

            <div class="d-flex">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isEdit ? 'Сохранить изменения' : 'Добавить врача' }}
              </button>
              <router-link to="/admin/doctors" class="btn btn-secondary ms-2">
                Отмена
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminDoctorService from '@/services/admin-doctor.service'
import SpecialtyService from '@/services/specialty.service'

export default {
  name: 'DoctorForm',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      doctorData: {
        name: '',
        email: '',
        password: '',
        nic: '',
        tel: '',
        specialtyId: ''
      },
      specialties: [],
      loading: false,
      error: null,
      saving: false
    }
  },
  created() {
    this.fetchSpecialties()

    if (this.isEdit && this.id) {
      this.fetchDoctor()
    }
  },
  methods: {
    // Получение списка специальностей
    async fetchSpecialties() {
      try {
        const response = await SpecialtyService.getAllSpecialties()

        if (response.status === 'success') {
          this.specialties = response.data.specialties
        }
      } catch (error) {
        console.error('Ошибка при получении специальностей:', error)
        this.error = 'Не удалось загрузить список специальностей. Пожалуйста, попробуйте позже.'
      }
    },

    // Получение данных врача при редактировании
    async fetchDoctor() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminDoctorService.getDoctor(this.id)

        if (response.status === 'success') {
          const doctor = response.data.doctor

          this.doctorData = {
            name: doctor.docname,
            email: doctor.docemail,
            password: '',
            nic: doctor.docnic,
            tel: doctor.doctel,
            specialtyId: doctor.specialties
          }
        } else {
          this.error = response.message || 'Ошибка при получении данных врача'
        }
      } catch (error) {
        console.error('Ошибка при получении врача:', error)
        this.error = 'Не удалось загрузить данные врача. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Сохранение данных врача
    async saveDoctor() {
      this.saving = true

      try {
        let response

        if (this.isEdit) {
          // Обновление существующего врача
          const updateData = {
            name: this.doctorData.name,
            nic: this.doctorData.nic,
            tel: this.doctorData.tel,
            specialtyId: this.doctorData.specialtyId
          }

          response = await AdminDoctorService.updateDoctor(this.id, updateData)

          // Если указан новый пароль, сбрасываем его
          if (this.doctorData.password) {
            await AdminDoctorService.resetDoctorPassword(this.id, this.doctorData.password)
          }
        } else {
          // Создание нового врача
          response = await AdminDoctorService.createDoctor({
            name: this.doctorData.name,
            email: this.doctorData.email,
            password: this.doctorData.password,
            nic: this.doctorData.nic,
            tel: this.doctorData.tel,
            specialtyId: this.doctorData.specialtyId
          })
        }

        if (response.status === 'success') {
          // Показываем уведомление об успешном сохранении
          this.$swal({
            title: 'Успешно!',
            text: this.isEdit
              ? 'Данные врача обновлены'
              : 'Врач успешно добавлен',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем на страницу со списком врачей
          this.$router.push('/admin/doctors')
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось сохранить данные врача',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при сохранении врача:', error)
        let errorMessage = 'Не удалось сохранить данные врача. Пожалуйста, попробуйте позже.'

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
    }
  }
}
</script>