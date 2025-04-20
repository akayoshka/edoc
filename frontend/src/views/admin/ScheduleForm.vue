<template>
  <div class="schedule-form-page">
    <h1>{{ isEdit ? 'Редактирование' : 'Создание' }} расписания</h1>

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
          <form @submit.prevent="saveSchedule">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="doctor" class="form-label">Врач</label>
                <select
                  class="form-select"
                  id="doctor"
                  v-model="scheduleData.doctorId"
                  required
                  :disabled="isEdit"
                >
                  <option value="" disabled>Выберите врача</option>
                  <option
                    v-for="doctor in doctors"
                    :key="doctor.docid"
                    :value="doctor.docid"
                  >
                    {{ doctor.docname }} ({{ doctor.specialty_name }})
                  </option>
                </select>
                <div v-if="isEdit" class="form-text text-muted">
                  Врача нельзя изменить
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label for="title" class="form-label">Название</label>
                <input
                  type="text"
                  class="form-control"
                  id="title"
                  v-model="scheduleData.title"
                  required
                  placeholder="Например: Консультация, Осмотр и т.д."
                >
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="date" class="form-label">Дата</label>
                <input
                  type="date"
                  class="form-control"
                  id="date"
                  v-model="scheduleData.date"
                  required
                  :min="minDate"
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="time" class="form-label">Время</label>
                <input
                  type="time"
                  class="form-control"
                  id="time"
                  v-model="scheduleData.time"
                  required
                >
              </div>
            </div>

            <div class="mb-3">
              <label for="nop" class="form-label">Количество мест</label>
              <input
                type="number"
                class="form-control"
                id="nop"
                v-model.number="scheduleData.nop"
                required

                :min="isEdit ? minSlots : 1"
              >
              <div v-if="isEdit && minSlots > 1" class="form-text text-danger">
                Вы не можете установить меньше {{ minSlots }} мест, так как уже имеется {{ bookedSlots }} записей.
              </div>
            </div>

            <div class="d-flex">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isEdit ? 'Сохранить изменения' : 'Создать расписание' }}
              </button>
              <router-link to="/admin/schedules" class="btn btn-secondary ms-2">
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
import AdminScheduleService from '@/services/admin-schedule.service'
import AdminDoctorService from '@/services/admin-doctor.service'

export default {
  name: 'ScheduleForm',
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
      scheduleData: {
        doctorId: '',
        title: '',
        date: '',
        time: '',
        nop: 10
      },
      doctors: [],
      loading: false,
      error: null,
      saving: false,
      bookedSlots: 0
    }
  },
  computed: {
    // Минимальная дата (сегодня)
    minDate() {
      return this.$moment().format('YYYY-MM-DD')
    },
    // Минимальное количество мест
    minSlots() {
      return this.bookedSlots
    }
  },
  created() {
    this.fetchDoctors()

    // Если это режим редактирования, загружаем данные расписания
    if (this.isEdit) {
      this.fetchSchedule()
    } else {
      // Если это новое расписание и в URL указан doctorId, заполняем его
      const doctorId = this.$route.query.doctorId
      if (doctorId) {
        this.scheduleData.doctorId = doctorId
      }
    }
  },
  methods: {
    // Получение списка врачей
    async fetchDoctors() {
      try {
        const response = await AdminDoctorService.getAllDoctors()

        if (response.status === 'success') {
          this.doctors = response.data.doctors
        }
      } catch (error) {
        console.error('Ошибка при получении врачей:', error)
        this.error = 'Не удалось загрузить список врачей. Пожалуйста, попробуйте позже.'
      }
    },

    // Получение данных расписания при редактировании
    async fetchSchedule() {
      this.loading = true
      this.error = null

      try {
        const response = await AdminScheduleService.getSchedule(this.id)

        if (response.status === 'success') {
          const schedule = response.data.schedule

          this.scheduleData = {
            doctorId: schedule.docid,
            title: schedule.title,
            date: schedule.scheduledate,
            time: schedule.scheduletime.substring(0, 5),
            nop: schedule.nop
          }

          this.bookedSlots = schedule.bookedSlots || 0
        } else {
          this.error = response.message || 'Ошибка при получении данных расписания'
        }
      } catch (error) {
        console.error('Ошибка при получении расписания:', error)
        this.error = 'Не удалось загрузить данные расписания. Пожалуйста, попробуйте позже.'
      } finally {
        this.loading = false
      }
    },

    // Сохранение данных расписания
    async saveSchedule() {
      this.saving = true

      try {
        let response

        if (this.isEdit) {
          // Обновление существующего расписания
          response = await AdminScheduleService.updateSchedule(this.id, {
            title: this.scheduleData.title,
            date: this.scheduleData.date,
            time: this.scheduleData.time,
            nop: this.scheduleData.nop
          })
        } else {
          // Создание нового расписания
          response = await AdminScheduleService.createSchedule({
            doctorId: this.scheduleData.doctorId,
            title: this.scheduleData.title,
            date: this.scheduleData.date,
            time: this.scheduleData.time,
            nop: this.scheduleData.nop
          })
        }

        if (response.status === 'success') {
          // Показываем уведомление об успешном сохранении
          this.$swal({
            title: 'Успешно!',
            text: this.isEdit
              ? 'Расписание обновлено'
              : 'Расписание создано',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем на страницу со списком расписаний
          this.$router.push('/admin/schedules')
        } else {
          this.$swal({
            title: 'Ошибка',
            text: response.message || 'Не удалось сохранить расписание',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Ошибка при сохранении расписания:', error)
        let errorMessage = 'Не удалось сохранить расписание. Пожалуйста, попробуйте позже.'

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