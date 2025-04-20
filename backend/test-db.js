const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/db');

async function testConnection() {
  try {
    // Вывод переменных окружения для проверки (без пароля)
    console.log('Проверка переменных окружения:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PASSWORD задан:', !!process.env.DB_PASSWORD);
    
    const result = await db.query('SELECT NOW()');
    console.log('Подключение к базе данных успешно!');
    console.log('Текущее время в базе данных:', result.rows[0].now);
    
    const usersResult = await db.query('SELECT COUNT(*) FROM webuser');
    console.log('Количество пользователей в базе данных:', usersResult.rows[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
}

testConnection();