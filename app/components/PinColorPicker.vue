<template>
  <div class="pinColorPicker">
    <button
      v-for="color in colors"
      :key="color"
      class="colorButton"
      :class="{ active: modelValue === color }"
      :style="{ backgroundColor: `var(--pin-color-${color})` }"
      @click="$emit('update:modelValue', color)"
    />
  </div>
</template>

<script setup lang="ts">
import type { PinColorName } from '~/utils/pinColor'

defineProps<{
  modelValue: PinColorName
}>()

defineEmits<{
  'update:modelValue': [value: PinColorName]
}>()

const colors: PinColorName[] = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'gray']
</script>

<style scoped>
.pinColorPicker {
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  border: 1px solid #ddd;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.colorButton {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.18);
  cursor: pointer;
}

.colorButton.active {
  transform: scale(1.15);
  border-color: #333;
}
</style>
