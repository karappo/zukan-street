<template>
  <div
    class="comment"
    :class="{ selected, editting, repositioning }"
    @click="$emit('select', data.id)"
  >
    <header>
      <div class="pin" :style="{ '--color': pinCssColor }" />
      <h5 class="title">{{ data.title }}</h5>
      <div ref="menuRef" class="menu">
        <div class="menu-button" @click.stop="isMenuOpen = !isMenuOpen">⋮</div>
        <div v-if="isMenuOpen" class="menu-options">
          <ul>
            <li @click.stop="clickOption('edit')">このピンをなおす</li>
            <li @click.stop="clickOption('reposition')">このピンをうごかす</li>
            <li class="danger" @click.stop="clickOption('delete')">このピンをけす</li>
          </ul>
        </div>
      </div>
    </header>
    <div v-if="data.desc" class="body">{{ data.desc }}</div>
    <div class="meta">{{ data.author }} · {{ data.time }}<span v-if="data.imageDate"> · 撮影 {{ data.imageDate }}</span></div>
  </div>
</template>

<script setup lang="ts">
import type { Pin } from '~/composables/usePins'
import { resolvePinColor } from '~/utils/pinColor'

const props = defineProps<{
  data: Pin
  selected: boolean
  editting: boolean
  repositioning: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  edit: [id: string]
  reposition: [id: string]
  delete: [id: string]
}>()

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const pinCssColor = computed(() => resolvePinColor(props.data.color))

function clickOption(slug: 'edit' | 'reposition' | 'delete') {
  isMenuOpen.value = false
  if (slug === 'edit') emit('edit', props.data.id)
  if (slug === 'reposition') emit('reposition', props.data.id)
  if (slug === 'delete') emit('delete', props.data.id)
}

function onWindowClick(e: MouseEvent) {
  if (!isMenuOpen.value) return
  const target = e.target as Node | null
  if (target && menuRef.value?.contains(target)) return
  isMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('click', onWindowClick)
})
</script>

<style scoped>
.comment {
  background: #fafafa;
  margin: 6px;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  border: 2px solid transparent;
  overflow: visible;
  position: relative;
  z-index: 1;
}

.comment.selected,
.comment.editting,
.comment.repositioning {
  border-color: #ccc;
  background: #fff;
}

.comment:hover,
.comment.selected {
  z-index: 2;
}

.comment:hover:has(.menu-options),
.comment.selected:has(.menu-options) {
  z-index: 10;
}

header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 3px;
}

.title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.8em;
}

.pin {
  margin-top: 2px;
  margin-right: 7px;
  --core-size: 4px;
  --size: 14px;
  border-radius: 50%;
  border: 3px solid transparent;
  width: var(--size);
  height: var(--size);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.pin::before {
  content: '';
  width: var(--core-size);
  height: var(--core-size);
  border-radius: 50%;
  border: 3px solid var(--color);
}

.menu {
  margin-left: auto;
  position: relative;
  visibility: hidden;
}

.menu-button {
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
}

.comment:hover .menu,
.comment.selected .menu {
  visibility: visible;
}

.menu-options {
  position: absolute;
  top: 24px;
  right: 0;
  padding: 5px 0;
  width: 130px;
  background-color: #ecf0f1;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(51, 51, 51, 0.2);
  z-index: 30;
}

.menu-options li {
  color: #333;
  cursor: pointer;
  padding: 6px 10px;
  font-size: 12px;
}

.menu-options li:hover {
  background-color: #007aff;
  color: #fff;
}

.menu-options li.danger {
  color: #b3261e;
}

.body {
  font-size: 13px;
  line-height: 1.8em;
  color: #3c3c3c;
  margin: 0 0 10px;
  white-space: pre-wrap;
  word-break: break-all;
}

.meta {
  font-size: 12px;
  color: #8d8d8d;
}
</style>
