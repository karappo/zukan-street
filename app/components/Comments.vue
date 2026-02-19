<template>
  <div class="wrap">
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
}>()

defineEmits<{
  selectPin: [id: string]
  editPin: [id: string]
  repositionPin: [id: string]
  deletePin: [id: string]
  savePin: [data: { title: string; desc: string; color: string }]
  cancelComposer: []
}>()
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
