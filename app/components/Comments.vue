<template>
  <div class="wrap">
    <div class="toolbar">
      <div ref="filterRef" class="filterMenu">
        <div class="menu-button" @click.stop="isFilterMenuOpen = !isFilterMenuOpen">
          <span class="filterIcon" />
          <span v-if="showAllDates" class="badge" />
        </div>
        <div v-if="isFilterMenuOpen" class="menu-options">
          <ul>
            <li :class="{ active: showAllDates }" @click="handleToggleFilter">
              べつの さつえい日も ひょうじ
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="scrollContainer">
      <Comment
        v-for="p in pins"
        :key="p.id"
        :data="p"
        :selected="selectedPinId === p.id"
        :editting="edittingPinId === p.id"
        :repositioning="repositioningPinId === p.id"
        @select="$emit('selectPin', $event)"
        @edit="$emit('editPin', $event)"
        @reposition="$emit('repositionPin', $event)"
        @delete="$emit('deletePin', $event)"
      />
      <p v-if="pins.length === 0" class="empty">ピンはありません</p>
    </div>
    <Composer
      :open="Boolean(draftPosition || edittingPinId)"
      :mode="edittingPinId ? 'edit' : draftPosition ? 'create' : null"
      :initial="composerInitial"
      @save="$emit('savePin', $event)"
      @cancel="$emit('cancelComposer')"
    />
  </div>
</template>

<script setup lang="ts">
import type { DraftPosition, Pin } from '~/composables/usePins'

defineProps<{
  pins: readonly Pin[]
  selectedPinId: string | null
  edittingPinId: string | null
  repositioningPinId: string | null
  draftPosition: DraftPosition | null
  composerInitial: { title: string; desc: string; color: string } | null
  showAllDates: boolean
}>()

const emit = defineEmits<{
  selectPin: [id: string]
  editPin: [id: string]
  repositionPin: [id: string]
  deletePin: [id: string]
  savePin: [data: { title: string; desc: string; color: string }]
  cancelComposer: []
  toggleShowAllDates: []
}>()

const isFilterMenuOpen = ref(false)
const filterRef = ref<HTMLElement | null>(null)

function handleToggleFilter() {
  emit('toggleShowAllDates')
  isFilterMenuOpen.value = false
}

function onWindowClick(e: MouseEvent) {
  if (!isFilterMenuOpen.value) return
  const target = e.target as Node | null
  if (target && filterRef.value?.contains(target)) return
  isFilterMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('click', onWindowClick)
})
</script>

<style scoped>
.wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
  border-left: 1px solid var(--border);
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.filterMenu {
  position: relative;

  .menu-button {
    cursor: pointer;
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    position: relative;

    &:hover {
      background: #f0f0f0;
    }
  }

  .filterIcon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    &::before,
    &::after {
      content: '';
      display: block;
      height: 2px;
      background: #666;
      border-radius: 1px;
    }

    &::before {
      width: 14px;
    }

    &::after {
      width: 8px;
    }
  }

  .badge {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff033e;
  }

  .menu-options {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    padding: 5px 0;
    min-width: 180px;
    background-color: #ecf0f1;
    border-radius: 4px;
    box-shadow: 0 3px 6px rgba(51, 51, 51, 0.2);
    z-index: 30;

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
}

.scrollContainer {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  padding: 6px 0;
  min-height: 0;
}

.scrollContainer:has(.comment.editting) .comment:not(.editting) {
  opacity: 0.5;
  pointer-events: none;
}

.scrollContainer::-webkit-scrollbar {
  width: 4px;
}

.scrollContainer::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.empty {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  font-size: 15px;
}
</style>
