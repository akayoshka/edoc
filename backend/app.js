const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импортируем маршруты
const authRoutes = require('./routes/authRoutes');
const specialtyRoutes = require('./routes/specialtyRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientProfileRoutes = require('./routes/patientProfileRoutes');
const doctorProfileRoutes = require('./routes/doctorProfileRoutes');
const doctorScheduleRoutes = require('./routes/doctorScheduleRoutes');
const doctorAppointmentRoutes = require('./routes/doctorAppointmentRoutes');
const adminSpecialtyRoutes = require('./routes/adminSpecialtyRoutes');
const adminDoctorRoutes = require('./routes/adminDoctorRoutes');
const adminPatientRoutes = require('./routes/adminPatientRoutes');
const adminScheduleRoutes = require('./routes/adminScheduleRoutes');
const adminAppointmentRoutes = require('./routes/adminAppointmentRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');

// Инициализация приложения Express
const app = express();

// Настройка middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Простой маршрут для проверки, что API работает
app.get('/', (req, res) => {
  res.json({ message: 'Добро пожаловать в API eDoc' });
});

// Использование маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient/profile', patientProfileRoutes);
app.use('/api/doctor/profile', doctorProfileRoutes);
app.use('/api/doctor/schedules', doctorScheduleRoutes);
app.use('/api/doctor/appointments', doctorAppointmentRoutes);
app.use('/api/admin/specialties', adminSpecialtyRoutes);
app.use('/api/admin/doctors', adminDoctorRoutes);
app.use('/api/admin/patients', adminPatientRoutes);
app.use('/api/admin/schedules', adminScheduleRoutes);
app.use('/api/admin/appointments', adminAppointmentRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

// Обработка ошибок 404 (маршрут не найден)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Не удалось найти ${req.originalUrl} на этом сервере!`
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Что-то пошло не так!'
  });
});

// Настройка порта и запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});