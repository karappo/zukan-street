<template>
  <div v-if="open" class="composer">
    <div class="title-row">
      <div class="pin-wrap">
        <div class="pin" :style="{ '--color': `var(--pin-color-${selectedColor})` }" />
        <PinColorPicker v-model="selectedColor" class="pinColorPicker" />
      </div>
      <input
        ref="titleInput"
        v-model="title"
        type="text"
        placeholder="たいとる"
      >
    </div>
    <hr>
    <textarea
      v-model="desc"
      class="comment"
      placeholder="こめんと"
    />
    <hr>
    <div class="bottom">
      <button class="btn cancel" @click="$emit('cancel')">やめる</button>
      <button class="btn save" @click="handleSave">保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PinColorName } from '~/utils/pinColor'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit' | null
  initial: { title: string; desc: string; color: string } | null
}>()

const emit = defineEmits<{
  cancel: []
  save: [data: { title: string; desc: string; color: string }]
}>()

const title = ref('')
const desc = ref('')
const selectedColor = ref<PinColorName>('red')
const titleInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.initial) {
      title.value = props.initial.title || ''
      desc.value = props.initial.desc || ''
      selectedColor.value = (props.initial.color || 'red') as PinColorName
    }
    nextTick(() => titleInput.value?.focus())
  },
)

watch(
  () => props.initial,
  (v) => {
    if (!props.open || !v) return
    title.value = v.title || ''
    desc.value = v.desc || ''
    selectedColor.value = (v.color || 'red') as PinColorName
  },
)

function handleSave() {
  emit('save', {
    title: title.value.trim() || '無題のピン',
    desc: desc.value.trim(),
    color: selectedColor.value,
  })
}
</script>

<style scoped>
.composer {
  border-top: 6px solid #f2f2f2;
  background: #fff;

  hr {
    width: calc(100% - 16px);
    height: 0;
    margin: 0 8px;
    border: 0;
    border-top: 1px solid #dedede;
  }
}

.title-row {
  display: flex;
  align-items: center;
  padding: 0 10px 0 4px;

  input {
    border: 0;
    width: 100%;
    font-size: 13px;
    line-height: 23px;
    padding: 10px 6px;
    outline: none;
  }
}

.pin-wrap {
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.pin-wrap:hover .pinColorPicker {
  opacity: 1;
  pointer-events: auto;
}

.pin {
  --color: var(--pin-color-red);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  border: 3px solid var(--color);
}

.pinColorPicker {
  position: absolute;
  top: 34px;
  left: -8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 20;
}

.comment {
  width: calc(100% - 24px);
  margin: 0 12px;
  border: 0;
  resize: vertical;
  min-height: 86px;
  font-size: 13px;
  line-height: 1.7;
  padding: 10px 0;
  outline: none;
}

.bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 9px 8px 8px;
}

.btn {
  border: none;
  border-radius: 6px;
  height: 34px;
  cursor: pointer;
  font-size: 13px;
}

.btn.cancel {
  background: #d7d7d7;
  color: #333;
}

.btn.save {
  background: #007aff;
  color: #fff;
}
</style>
