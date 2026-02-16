<template>
  <Teleport to="body">
    <div class="modal-overlay" :class="{ show: open }" @click.self="$emit('update:open', false)">
      <div class="modal">
        <h3>📌 アノテーションを追加</h3>
        <div class="form-group">
          <label>タイトル</label>
          <input
            ref="titleInput"
            v-model="title"
            type="text"
            placeholder="例：YCAMの入口"
          >
        </div>
        <div class="form-group">
          <label>説明</label>
          <textarea
            v-model="desc"
            placeholder="気づいたことやメモを入力..."
          />
        </div>
        <div class="form-group">
          <label>ピンの色</label>
          <div class="color-picker">
            <div
              v-for="c in colors"
              :key="c"
              class="color-opt"
              :class="{ selected: selectedColor === c }"
              :style="{ background: c }"
              @click="selectedColor = c"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="handleCancel">キャンセル</button>
          <button class="btn-save" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: { title: string; desc: string; color: string }]
}>()

const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']
const title = ref('')
const desc = ref('')
const selectedColor = ref('#ef4444')
const titleInput = ref<HTMLInputElement | null>(null)

watch(() => props.open, (val) => {
  if (val) {
    nextTick(() => titleInput.value?.focus())
  }
})

function handleCancel() {
  resetForm()
  emit('update:open', false)
}

function handleSave() {
  emit('save', {
    title: title.value.trim() || '無題のピン',
    desc: desc.value.trim(),
    color: selectedColor.value,
  })
  resetForm()
  emit('update:open', false)
}

function resetForm() {
  title.value = ''
  desc.value = ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: none;
  place-items: center;

  &.show {
    display: grid;
  }
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);

  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    input, textarea {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-family: var(--font-ja);
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s;

      &:focus {
        border-color: var(--accent);
      }
    }

    textarea {
      resize: vertical;
      min-height: 72px;
    }
  }

  .color-picker {
    display: flex;
    gap: 8px;

    .color-opt {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s;

      &.selected {
        border-color: #fff;
        transform: scale(1.15);
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;

    button {
      padding: 8px 18px;
      border: none;
      border-radius: 8px;
      font-family: var(--font-ja);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-cancel {
      background: var(--bg);
      color: var(--text-muted);
      border: 1px solid var(--border);

      &:hover { color: var(--text); }
    }

    .btn-save {
      background: var(--accent);
      color: #fff;

      &:hover { background: #4a7ae4; }
    }
  }
}
</style>
