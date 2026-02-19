<template>
  <div v-if="availableTimeline.length > 1" ref="dropdownRef" class="time-machine" @click.stop>
    <button class="time-machine-button" @click="isOpen = !isOpen">
      <svg class="clock-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.2A5.8 5.8 0 1 1 2.2 8 5.8 5.8 0 0 1 8 2.2zM7.4 4v4.4l3.4 2 .6-1-2.8-1.7V4z" />
      </svg>
      {{ currentLabel }}
    </button>
    <ul v-if="isOpen" class="time-machine-menu">
      <li
        v-for="entry in availableTimeline"
        :key="entry.pano"
        :class="{ active: isActive(entry) }"
        @click="handleSelect(entry.pano)"
      >
        {{ formatDate(entry.date) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { TimelineEntry } from '~/composables/useGoogleMaps'

const { availableTimeline, currentImageDate, switchTimeline } = useGoogleMaps()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const currentLabel = computed(() => {
  if (!currentImageDate.value) return ''
  const [y, m] = currentImageDate.value.split('-')
  return `${y}年${parseInt(m)}月`
})

function isActive(entry: TimelineEntry) {
  if (!currentImageDate.value) return false
  const [y, m] = currentImageDate.value.split('-')
  return entry.date.getFullYear() === parseInt(y) && entry.date.getMonth() + 1 === parseInt(m)
}

function formatDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function handleSelect(panoId: string) {
  switchTimeline(panoId)
  isOpen.value = false
}

function onWindowClick(e: MouseEvent) {
  if (!isOpen.value) return
  const target = e.target as Node | null
  if (target && dropdownRef.value?.contains(target)) return
  isOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('click', onWindowClick)
})
</script>

<style scoped>
.time-machine {
  position: absolute;
  bottom: 30px;
  left: 12px;
  z-index: 25;
}

.time-machine-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background-color: rgba(34, 34, 34, 0.65);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--font-ja);
  cursor: pointer;
  backdrop-filter: blur(4px);
  line-height: 1;

  &:hover {
    background-color: rgba(34, 34, 34, 0.85);
  }

  .clock-icon {
    flex-shrink: 0;
  }
}

.time-machine-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
  padding: 5px 0;
  min-width: 120px;
  background-color: #ecf0f1;
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(51, 51, 51, 0.2);
  list-style: none;
  max-height: 240px;
  overflow-y: auto;

  li {
    color: #333;
    cursor: pointer;
    padding: 6px 10px;
    font-size: 12px;

    &:hover {
      background-color: #007aff;
      color: #fff;
    }

    &.active {
      background-color: #e8e8e8;

      &::before {
        content: '\2713  ';
      }

      &:hover {
        background-color: #007aff;
        color: #fff;
      }
    }
  }
}
</style>
