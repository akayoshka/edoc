<template>
  <footer class="footer py-3 bg-light mt-5">
    <div class="container text-center">
      <span class="text-muted">© {{ currentYear }} eDoc. Все права защищены.</span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>