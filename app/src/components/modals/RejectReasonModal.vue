<template>
  <div v-if="visible" class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal">
      <h3>Причина отклонения</h3>
      <textarea v-model="reason" rows="5" placeholder="Можно оставить пустым" />
      <div class="modal-actions">
        <button class="btn-save" @click="submit">Сохранить</button>
        <button class="btn-cancel" @click="$emit('cancel')">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', reason: string | null): void
  (e: 'cancel'): void
}>()

const reason = ref('')

watch(
  () => props.visible,
  () => {
    reason.value = ''
  },
)

function submit() {
  emit('submit', reason.value.trim() || null)
}
</script>
