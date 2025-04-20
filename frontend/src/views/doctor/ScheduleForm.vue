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
            <div class="mb-3">
              <label for="title" class="form-label">Название расписания</label>
              <input
                type="text"
                class="form-control"
                id="title"
                v-model="scheduleData.title"
                required
                placeholder="Например: Консультация, Осмотр и т.д."
              >
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
              <router-link to="/doctor/schedules" class="btn btn-secondary ms-2">
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
import DoctorScheduleService from '@/services/doctor-schedule.service'

export default {
  name: 'DoctorScheduleForm',
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
        title: '',
        date: '',
        time: '',
        nop: 10
      },
      loading: false,
      saving: false,
      error: null,
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
    // Если это режим редактирования, загружаем данные расписания
    if (this.isEdit) {
      this.fetchSchedule()
    }
  },
  methods: {
    // Получение данных расписания при редактировании
    async fetchSchedule() {
      this.loading = true
      this.error = null

      try {
        const response = await DoctorScheduleService.getSchedule(this.id)

        if (response.status === 'success') {
          const schedule = response.data.schedule

          this.scheduleData = {
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

    // Сохранение расписания
    async saveSchedule() {
      this.saving = true

      try {
        let response

        if (this.isEdit) {
          // Обновление существующего расписания
          response = await DoctorScheduleService.updateSchedule(this.id, {
            title: this.scheduleData.title,
            date: this.scheduleData.date,
            time: this.scheduleData.time,
            nop: this.scheduleData.nop
          })
        } else {
          // Создание нового расписания
          response = await DoctorScheduleService.createSchedule({
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
              ? 'Расписание успешно обновлено'
              : 'Расписание успешно создано',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })

          // Перенаправляем на страницу расписаний
          this.$router.push('/doctor/schedules')
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