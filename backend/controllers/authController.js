const Admin = require('../models/adminModel');
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const { generateToken } = require('../utils/jwtUtils');

// Функция аутентификации администратора
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка, существует ли администратор
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // Проверка пароля
    const isPasswordCorrect = await Admin.checkPassword(email, password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // Генерация JWT токена
    const token = generateToken({ email, usertype: 'a' });

    res.status(200).json({
      status: 'success',
      message: 'Вход выполнен успешно',
      data: {
        token,
        user: {
          email: admin.aemail,
          userType: 'a'
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при входе администратора:', error);
    res.status(500).json({
      status: 'error',
      message: 'Произошла ошибка при попытке входа. Пожалуйста, попробуйте позже.'
    });
  }
};

// Функция аутентификации врача
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка, существует ли врач
    const doctor = await Doctor.findByEmail(email);
    if (!doctor) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // Проверка пароля
    const isPasswordCorrect = await Doctor.checkPassword(email, password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // Генерация JWT токена
    const token = generateToken({ email, usertype: 'd' });

    res.status(200).json({
      status: 'success',
      message: 'Вход выполнен успешно',
      data: {
        token,
        user: {
          id: doctor.docid,
          name: doctor.docname,
          email: doctor.docemail,
          userType: 'd'
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при входе врача:', error);
    res.status(500).json({
      status: 'error',
      message: 'Произошла ошибка при попытке входа. Пожалуйста, попробуйте позже.'
    });
  }
};

// Функция аутентификации пациента
const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка, существует ли пациент
    const patient = await Patient.findByEmail(email);
    if (!patient) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // Проверка пароля
    const isPasswordCorrect = await Patient.checkPassword(email, password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // Генерация JWT токена
    const token = generateToken({ email, usertype: 'p' });

    res.status(200).json({
      status: 'success',
      message: 'Вход выполнен успешно',
      data: {
        token,
        user: {
          id: patient.pid,
          name: patient.pname,
          email: patient.pemail,
          userType: 'p'
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при входе пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Произошла ошибка при попытке входа. Пожалуйста, попробуйте позже.'
    });
  }
};

// Универсальная функция входа, определяющая тип пользователя автоматически
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверяем, существует ли пользователь
    const user = await require('../models/userModel').findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // В зависимости от типа пользователя вызываем соответствующую функцию
    if (user.usertype === 'a') {
      return loginAdmin(req, res);
    } else if (user.usertype === 'd') {
      return loginDoctor(req, res);
    } else if (user.usertype === 'p') {
      return loginPatient(req, res);
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Неизвестный тип пользователя'
      });
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({
      status: 'error',
      message: 'Произошла ошибка при попытке входа. Пожалуйста, попробуйте позже.'
    });
  }
};

// Регистрация нового пациента
const registerPatient = async (req, res) => {
  try {
    const { name, email, password, address, nic, dob, tel } = req.body;

    // Проверка, существует ли уже пользователь с таким email
    const userExists = await require('../models/userModel').exists(email);
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Создание нового пациента
    const patient = await Patient.create(email, name, password, address, nic, dob, tel);

    // Генерация JWT токена
    const token = generateToken({ email, usertype: 'p' });

    res.status(201).json({
      status: 'success',
      message: 'Регистрация выполнена успешно',
      data: {
        token,
        user: {
          id: patient.pid,
          name: patient.pname,
          email: patient.pemail,
          userType: 'p'
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при регистрации пациента:', error);
    res.status(500).json({
      status: 'error',
      message: 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.'
    });
  }
};

// Получение информации о текущем пользователе
const getCurrentUser = async (req, res) => {
  try {
    const { email, userType } = req.user;

    let userData;

    if (userType === 'a') {
      const admin = await Admin.findByEmail(email);
      userData = {
        email: admin.aemail,
        userType: 'a'
      };
    } else if (userType === 'd') {
      const doctor = await Doctor.findByEmail(email);
      userData = {
        id: doctor.docid,
        name: doctor.docname,
        email: doctor.docemail,
        specialtyId: doctor.specialties,
        specialtyName: doctor.specialty_name,
        userType: 'd'
      };
    } else if (userType === 'p') {
      const patient = await Patient.findByEmail(email);
      userData = {
        id: patient.pid,
        name: patient.pname,
        email: patient.pemail,
        address: patient.paddress,
        nic: patient.pnic,
        dob: patient.pdob,
        tel: patient.ptel,
        userType: 'p'
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({
      status: 'error',
      message: 'Произошла ошибка при получении данных пользователя. Пожалуйста, попробуйте позже.'
    });
  }
};

module.exports = {
  login,
  loginAdmin,
  loginDoctor,
  loginPatient,
  registerPatient,
  getCurrentUser
};