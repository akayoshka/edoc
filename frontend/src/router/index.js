import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Компоненты для пациентов
const PatientDashboard = () => import('../views/patient/Dashboard.vue')
const PatientDoctors = () => import('../views/patient/Doctors.vue')
const PatientDoctorDetail = () => import('../views/patient/DoctorDetail.vue')
const PatientAppointments = () => import('../views/patient/Appointments.vue')
const PatientAppointmentDetail = () => import('../views/patient/AppointmentDetail.vue')
const PatientProfile = () => import('../views/patient/Profile.vue')

// Компоненты для врачей
const DoctorDashboard = () => import('../views/doctor/Dashboard.vue')
const DoctorSchedules = () => import('../views/doctor/Schedules.vue')
const DoctorScheduleForm = () => import('../views/doctor/ScheduleForm.vue')
const DoctorScheduleDetail = () => import('../views/doctor/ScheduleDetail.vue')
const DoctorAppointments = () => import('../views/doctor/Appointments.vue')
const DoctorAppointmentDetail = () => import('../views/doctor/AppointmentDetail.vue')
const DoctorProfile = () => import('../views/doctor/Profile.vue')

// Компоненты для администраторов
const AdminDashboard = () => import('../views/admin/Dashboard.vue')
const AdminDoctors = () => import('../views/admin/Doctors.vue')
const AdminDoctorForm = () => import('../views/admin/DoctorForm.vue')
const AdminDoctorDetail = () => import('../views/admin/DoctorDetail.vue')
const AdminPatients = () => import('../views/admin/Patients.vue')
const AdminPatientForm = () => import('../views/admin/PatientForm.vue')
const AdminPatientDetail = () => import('../views/admin/PatientDetail.vue')
const AdminSpecialties = () => import('../views/admin/Specialties.vue')
const AdminSchedules = () => import('../views/admin/Schedules.vue')
const AdminScheduleForm = () => import('../views/admin/ScheduleForm.vue')
const AdminScheduleDetail = () => import('../views/admin/ScheduleDetail.vue')
const AdminAppointments = () => import('../views/admin/Appointments.vue')
const AdminAppointmentForm = () => import('../views/admin/AppointmentForm.vue')
const AdminAppointmentDetail = () => import('../views/admin/AppointmentDetail.vue')
const AdminStats = () => import('../views/admin/Stats.vue')

// Ленивая загрузка компонентов
const HomeView = () => import('../views/Home.vue')
const LoginView = () => import('../views/auth/Login.vue')
const RegisterView = () => import('../views/auth/Register.vue')


// Страница ошибки 404
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: {
      render(c) {
        return c('div')
      }
    },
    beforeEnter: (to, from, next) => {
      const userType = store.getters.userType
      if (userType === 'p') {
        next('/patient')
      } else if (userType === 'd') {
        next('/doctor')
      } else if (userType === 'a') {
        next('/admin')
      } else {
        next('/login')
      }
    }
  },
  // Маршруты для пациентов
  {
    path: '/patient',
    name: 'PatientDashboard',
    component: PatientDashboard,
    meta: { requiresAuth: true, userType: 'p' }
  },
  {
    path: '/patient/doctors',
    name: 'PatientDoctors',
    component: PatientDoctors,
    meta: { requiresAuth: true, userType: 'p' }
  },
  {
    path: '/patient/doctors/:id',
    name: 'PatientDoctorDetail',
    component: PatientDoctorDetail,
    meta: { requiresAuth: true, userType: 'p' }
  },
  {
    path: '/patient/appointments',
    name: 'PatientAppointments',
    component: PatientAppointments,
    meta: { requiresAuth: true, userType: 'p' }
  },
  {
    path: '/patient/appointments/:id',
    name: 'PatientAppointmentDetail',
    component: PatientAppointmentDetail,
    meta: { requiresAuth: true, userType: 'p' }
  },
  {
    path: '/patient/profile',
    name: 'PatientProfile',
    component: PatientProfile,
    meta: { requiresAuth: true, userType: 'p' }
  },

  // Маршруты для врачей
  {
    path: '/doctor',
    name: 'DoctorDashboard',
    component: DoctorDashboard,
    meta: { requiresAuth: true, userType: 'd' }
  },
  {
    path: '/doctor/schedules',
    name: 'DoctorSchedules',
    component: DoctorSchedules,
    meta: { requiresAuth: true, userType: 'd' }
  },
  {
    path: '/doctor/schedules/create',
    name: 'DoctorScheduleCreate',
    component: DoctorScheduleForm,
    meta: { requiresAuth: true, userType: 'd' }
  },
  {
    path: '/doctor/schedules/:id',
    name: 'DoctorScheduleDetail',
    component: DoctorScheduleDetail,
    meta: { requiresAuth: true, userType: 'd' }
  },
  {
    path: '/doctor/schedules/:id/edit',
    name: 'DoctorScheduleEdit',
    component: DoctorScheduleForm,
    props: route => ({ isEdit: true, id: route.params.id }),
    meta: { requiresAuth: true, userType: 'd' }
  },
  {
    path: '/doctor/appointments',
    name: 'DoctorAppointments',
    component: DoctorAppointments,
    meta: { requiresAuth: true, userType: 'd' }
  },
  {
    path: '/doctor/appointments/:id',
    name: 'DoctorAppointmentDetail',
    component: DoctorAppointmentDetail,
    meta: { requiresAuth: true, userType: 'd' }
  },
  {
    path: '/doctor/profile',
    name: 'DoctorProfile',
    component: DoctorProfile,
    meta: { requiresAuth: true, userType: 'd' }
  },

  // Маршруты для администраторов
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, userType: 'a' }
  },
  // Маршруты для врачей (admin)
  {
    path: '/admin/doctors',
    name: 'AdminDoctors',
    component: AdminDoctors,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/doctors/create',
    name: 'AdminDoctorCreate',
    component: AdminDoctorForm,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/doctors/:id',
    name: 'AdminDoctorDetail',
    component: AdminDoctorDetail,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/doctors/:id/edit',
    name: 'AdminDoctorEdit',
    component: AdminDoctorForm,
    props: route => ({ isEdit: true, id: route.params.id }),
    meta: { requiresAuth: true, userType: 'a' }
  },
  // Маршруты для пациентов (admin)
  {
    path: '/admin/patients',
    name: 'AdminPatients',
    component: AdminPatients,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/patients/create',
    name: 'AdminPatientCreate',
    component: AdminPatientForm,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/patients/:id',
    name: 'AdminPatientDetail',
    component: AdminPatientDetail,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/patients/:id/edit',
    name: 'AdminPatientEdit',
    component: AdminPatientForm,
    props: route => ({ isEdit: true, id: route.params.id }),
    meta: { requiresAuth: true, userType: 'a' }
  },
  // Маршруты для специальностей
  {
    path: '/admin/specialties',
    name: 'AdminSpecialties',
    component: AdminSpecialties,
    meta: { requiresAuth: true, userType: 'a' }
  },
  // Маршруты для расписаний (admin)
  {
    path: '/admin/schedules',
    name: 'AdminSchedules',
    component: AdminSchedules,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/schedules/create',
    name: 'AdminScheduleCreate',
    component: AdminScheduleForm,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/schedules/:id',
    name: 'AdminScheduleDetail',
    component: AdminScheduleDetail,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/schedules/:id/edit',
    name: 'AdminScheduleEdit',
    component: AdminScheduleForm,
    props: route => ({ isEdit: true, id: route.params.id }),
    meta: { requiresAuth: true, userType: 'a' }
  },
  // Маршруты для записей на прием (admin)
  {
    path: '/admin/appointments',
    name: 'AdminAppointments',
    component: AdminAppointments,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/appointments/create',
    name: 'AdminAppointmentCreate',
    component: AdminAppointmentForm,
    meta: { requiresAuth: true, userType: 'a' }
  },
  {
    path: '/admin/appointments/:id',
    name: 'AdminAppointmentDetail',
    component: AdminAppointmentDetail,
    meta: { requiresAuth: true, userType: 'a' }
  },
  // Статистика системы
  {
    path: '/admin/stats',
    name: 'AdminStats',
    component: AdminStats,
    meta: { requiresAuth: true, userType: 'a' }
  },

  // Страница 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Навигационные хуки
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated
  const userType = store.getters.userType

  // Проверка аутентификации
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // Проверка гостевого доступа
  else if (to.meta.requiresGuest && isAuthenticated) {
    if (userType === 'p') next('/patient')
    else if (userType === 'd') next('/doctor')
    else if (userType === 'a') next('/admin')
    else next('/')
  }
  // Проверка типа пользователя
  else if (to.meta.userType && to.meta.userType !== userType) {
    next('/')
  }
  else {
    next()
  }
})

export default router