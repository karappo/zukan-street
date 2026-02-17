<template>
  <div class="pinColorPicker">
    <div class="colors">
      <div
        v-for="color in colors"
        :key="color"
        class="color"
        :class="{ selected: color === modelValue }"
        :style="`background-color: var(--pin-color-${color})`"
        @click="$emit('update:modelValue', color)"
      >
        <svg class="check" xmlns="http://www.w3.org/2000/svg" width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3L3.5 5.5L5.75 3.25L8 1" :stroke="`${color === 'yellow' ? 'black' : 'white'}`"/>
        </svg>
      </div>
    </div>
    <div class="background">
      <img src="@/assets/image/pin-color-picker-background.svg" />
    </div>
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
  background-color: #ffffff;
  position: relative;
}

.colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 5px;
  position: absolute;
  top: 13px;
  left: 6px;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.color {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  .check {
    display: none;
    position: relative;
    top: 1px;
  }

  &.selected {
    .check {
      display: block;
    }
  }
}
</style>
