<template>
  <div class="page">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Поиск по ФИО, отделу, должности..."
      class="search-input"
    />

    <div class="filters-row">
      <select v-model="selectedOrganization" class="org-select">
        <option value="">Все организации</option>
        <option v-for="org in organizations" :key="org" :value="org">
          {{ org }}
        </option>
      </select>

      <select v-model="approvalFilter" class="status-select">
        <option value="approved">Одобренные</option>
        <option value="pending">На рассмотрении</option>
        <option value="rejected">Отклоненные</option>
      </select>

      <label class="checkbox-label">
        <input type="checkbox" v-model="showOnlyInactive" class="checkbox-input" />
        Уволенные сотрудники
      </label>

      <label class="checkbox-label">
        <input type="checkbox" v-model="showDeleted" class="checkbox-input" />
        Удаленные операции
      </label>
    </div>

    <div class="page-controls" v-if="canManage && !showDeleted && !showOnlyInactive">
      <button class="btn-add" @click="openForm()">Добавить</button>
    </div>

    <div :class="['cards-wrap', isDirector ? 'one-col' : 'four-cols']">
      <HrOperationCard
        v-for="row in filtered"
        :key="row.id_hr_operation"
        :row="row"
        :is-director="isDirector"
        :can-manage="canManage"
        :is-created-operation="isCreatedOperation"
        :get-changed-fields="getChangedFields"
        @edit="openForm"
        @delete="deleteRow"
        @restore="restoreRow"
        @approve="approveRow"
        @reject="rejectRow"
        @revert="revertRow"
      />
    </div>

    <div v-if="!filtered.length" class="empty-state">Ничего не найдено</div>

    <HrOperationModal
      :visible="form.visible"
      :payload="form.current"
      :on-save="saveForm"
      :existing-operations="actualList"
      @cancel="closeForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import HrOperationCard from '../components/cards/HrOperationCard.vue'
import HrOperationModal from '../components/modals/HrOperationModal.vue'
import { useHrOperations } from '../composables/useHrOperations'
import { useAuth } from '../composables/useAuth'
import type { HrOperation, HrOperationSave, ApprovalStatus } from '../entities/hrOperation'

const {
  reloadAll,
  isCreatedOperation,
  getChangedFields,
  actualList,
  deletedList,
  saveOperation,
  approveOperation,
  rejectOperation,
  deleteOperation,
  restoreOperation,
  revertOperation,
} = useHrOperations()

const { currentUser, canManage } = useAuth()
const isDirector = computed(() => currentUser.value?.id_role === 3)
const searchQuery = ref('')
const selectedOrganization = ref('')
const showDeleted = ref(false)
const showOnlyInactive = ref(false)
const approvalFilter = ref<ApprovalStatus>(isDirector.value ? 'pending' : 'approved')
const currentList = computed(() => (showDeleted.value ? deletedList.value : actualList.value))

const organizations = computed(() => {
  const names = currentList.value.map((op) => op.organization_name).filter(Boolean)

  return [...new Set(names)]
})

const filtered = computed(() => {
  let list = currentList.value

  list = list.filter((op) => op.approval_status === approvalFilter.value)

  if (showOnlyInactive.value) {
    list = list.filter((op) => !op.is_active)
  } else if (!showDeleted.value) {
    list = list.filter((op) => op.is_active)
  }

  if (selectedOrganization.value) {
    list = list.filter((op) => op.organization_name === selectedOrganization.value)
  }

  const q = searchQuery.value.trim().toLowerCase()

  if (!q) return list

  return list.filter(
    (op) =>
      op.employee_name?.toLowerCase().includes(q) ||
      op.department_name?.toLowerCase().includes(q) ||
      op.position_name?.toLowerCase().includes(q),
  )
})

async function loadLists() {
  await reloadAll()
}

onMounted(loadLists)

const form = reactive<{
  visible: boolean
  current: HrOperation | null
}>({
  visible: false,
  current: null,
})

function openForm(row?: HrOperation) {
  if (!canManage.value) return
  form.current = row ?? null
  form.visible = true
}

function closeForm() {
  form.visible = false
  form.current = null
}

async function saveForm(payload: HrOperationSave) {
  await saveOperation(payload)

  closeForm()
}

async function approveRow(row: HrOperation) {
  await approveOperation(row.id_hr_operation)
}

async function rejectRow(row: HrOperation) {
  await rejectOperation(row.id_hr_operation)
}

async function deleteRow(row: HrOperation) {
  await deleteOperation(row.id_hr_operation)
}

async function restoreRow(row: HrOperation) {
  await restoreOperation(row.id_hr_operation)
}

async function revertRow(row: HrOperation) {
  await revertOperation(row.id_hr_operation)
}
</script>

<style scoped>
.filters-row {
  display: flex;
  align-items: center;
  gap: 20px;

  margin-top: 12px;
  margin-bottom: 12px;
}

.org-select {
  width: 260px;
}

.status-select {
  width: 240px;
}

.one-col {
  grid-template-columns: 1fr;
}
</style>
