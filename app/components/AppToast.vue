<template>
  <Teleport to="body">
    <div class="toast" :class="{ show: toastVisible }">
      {{ toastMessage }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toastMessage, toastVisible } = useToast()
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--surface);
  border: 1px solid var(--accent);
  color: var(--text);
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 13px;
  z-index: 300;
  opacity: 0;
  transition: all 0.3s;
  pointer-events: none;

  &.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
