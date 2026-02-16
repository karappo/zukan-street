<template>
  <div v-if="open" class="composer">
    <div class="title-row">
      <div class="pin-wrap">
        <div class="pin" :style="{ '--color': selectedColor }" />
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
    <div class="color-row">
      <span class="label">いろ</span>
      <div class="color-picker">
        <button
          v-for="c in colors"
          :key="c"
          class="color-opt"
          :class="{ selected: selectedColor === c }"
          :style="{ background: c }"
          @click="selectedColor = c"
        />
      </div>
    </div>
    <hr>
    <div class="bottom">
      <button class="btn cancel" @click="$emit('cancel')">やめる</button>
      <button class="btn save" @click="handleSave">保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const selectedColor = ref('#ef4444')
const titleInput = ref<HTMLInputElement | null>(null)
const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.initial) {
      title.value = props.initial.title || ''
      desc.value = props.initial.desc || ''
      selectedColor.value = props.initial.color || '#ef4444'
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
    selectedColor.value = v.color || '#ef4444'
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
}

.pin {
  --color: #ef4444;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  border: 3px solid var(--color);
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

.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;

  .label {
    font-size: 12px;
    color: #848484;
  }
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-opt {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.color-opt.selected {
  border-color: #333;
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
