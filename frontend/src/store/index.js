import { createStore } from 'vuex'

export default createStore({
  state: {
    // Состояние аутентификации
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token')
  },
  getters: {
    // Геттеры для доступа к состоянию
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user,
    token: state => state.token,
    userType: state => state.user ? state.user.userType : null
  },
  mutations: {
    // Мутации для изменения состояния
    SET_AUTH(state, { token, user }) {
      state.token = token
      state.user = user
      state.isAuthenticated = true

      // Сохраняем данные в localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
      state.isAuthenticated = false

      // Удаляем данные из localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  actions: {
    // Действия для выполнения асинхронных операций
    login({ commit }, { token, user }) {
      commit('SET_AUTH', { token, user })
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    }
  },
  modules: {
    // Здесь будут подмодули Vuex (если потребуется)
  }
})