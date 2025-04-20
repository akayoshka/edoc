<template>
  <div class="patient-form-page">
    <h1>{{ isEdit ? 'Редактирование' : 'Добавление' }} пациента</h1>

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
          <form @submit.prevent="savePatient">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="name" class="form-label">ФИО</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="patientData.name"
                  required
                  placeholder="Введите ФИО пациента"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="patientData.email"
                  required
                  placeholder="Введите email пациента"
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
                  v-model="patientData.password"
                  :required="!isEdit"
                  placeholder="Введите пароль"
                >
                <div v-if="isEdit" class="form-text text-muted">
                  Оставьте пустым, чтобы не менять пароль
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label for="dob" class="form-label">Дата рождения</label>
                <input
                  type="date"
                  class="form-control"
                  id="dob"
                  v-model="patientData.dob"
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
                  v-model="patientData.tel"
                  placeholder="Введите номер телефона"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="nic" class="form-label">Паспорт/ID</label>
                <input
                  type="text"
                  class="form-control"
                  id="nic"
                  v-model="patientData.nic"
                  placeholder="Введите номер паспорта/ID"
                >
              </div>
            </div>

            <div class="mb-3">
              <label for="address" class="form-label">Адрес</label>
              <textarea
                class="form-control"
                id="address"
                v-model="patientData.address"
                rows="3"
                placeholder="Введите адрес пациента"
              ></textarea>
            </div>

            <div class="d-flex">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isEdit ? 'Сохранить изменения' : 'Добавить пациента' }}
              </button>
              <router-link to="/admin/patients" class="btn btn-secondary ms-2">
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
import AdminPatientService from '@/services/admin-patient.service'

export default {
  name: 'PatientForm',
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
      patientData: {
        name: '',
        email: '',
        password: '',
        dob: '',
        tel: '',
        nic: '',
        address: ''
      },
      loading: false,
      error: null,
      saving: false
    }
  },
  created() {
    if (this.isEdit && this.id) {
      this.fetchPatient()
    }
  },
  methods: {
    // Получение данных пациента при редактировании
    async fetchPatient() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminPatientService.getPatient(this.id)

        if (response.status === 'success') {
          const patient = response.data.patient

          this.patientData = {
            name: patient.pname,
            email: patient.pemail,
            password: '',
            dob: patient.pdob,
            tel: patient.ptel,
            nic: patient.pnic,
            address: patient.paddress
          }
        } else {
          this.error = response.message || 'Ошибка при получении данных пациента'
        }
      } catch (error) {
        console.error('Ошибка при получении пациента:', error)
        this.error = 'Не удалось загрузить данные пациента. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Сохранение данных пациента
    async savePatient() {
      this.saving = true

      try {
        let response

        if (this.isEdit) {
          // Обновление существующего пациента
          const updateData = {
            name: this.patientData.name,
            address: this.patientData.address,
            nic: this.patientData.nic,
            tel: this.patientData.tel
          }

          response = await AdminPatientService.updatePatient(this.id, updateData)

          // Если указан новый пароль, сбрасываем его
          if (this.patientData.password) {
            await AdminPatientService.resetPatientPassword(this.id, this.patientData.password)
          }
        } else {
          // Создание нового пациента
          response = await AdminPatientService.createPatient({
            name: this.patientData.name,
            email: this.patientData.email,
            password: this.patientData.password,
            dob: this.patientData.dob,
            tel: this.patientData.tel,
            nic: this.patientData.nic,
            address: this.patientData.address
          })
        }

        if (response.status === 'success') {
          // Показываем уведомление об успешном сохранении
          this.$swal({
            title: 'Успешно!',
            text: this.isEdit
              ? 'Данные пациента обновлены'
              : 'Пациент успешно добавлен',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем на страницу со списком пациентов
          this.$router.push('/admin/patients')
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось сохранить данные пациента',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при сохранении пациента:', error)
        let errorMessage = 'Не удалось сохранить данные пациента. Пожалуйста, попробуйте позже.'

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