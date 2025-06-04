<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout />
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: var(--font-family);
}

* {
  box-sizing: border-box;
}

/* 路由过渡效果 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
