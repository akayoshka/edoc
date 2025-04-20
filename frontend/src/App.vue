<template>
  <div id="app">
    <auth-verify />
    <nav-bar v-if="isAuthenticated" />
    <div class="container mt-4">
      <router-view/>
    </div>
    <app-footer />
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AuthVerify from '@/components/auth/AuthVerify.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    NavBar,
    AppFooter,
    AuthVerify
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  }
}
</script>