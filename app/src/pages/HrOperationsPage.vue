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

      <button class="export-btn" title="Сформировать отчет" @click="exportExcel">
        <Icon icon="mdi:microsoft-excel" width="20" />
        <span class="export-text"> Отчет </span>
      </button>
    </div>

    <div class="page-controls">
      <button
        v-if="canManage && !showDeleted && !showOnlyInactive"
        class="btn-add"
        @click="openForm()"
      >
        Добавить
      </button>
    </div>

    <div v-if="exportError" class="error-box">{{ exportError }}</div>

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

    <RejectReasonModal
      :visible="rejectModal.visible"
      @submit="submitReject"
      @cancel="closeRejectModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import HrOperationCard from '../components/cards/HrOperationCard.vue'
import HrOperationModal from '../components/modals/HrOperationModal.vue'
import RejectReasonModal from '../components/modals/RejectReasonModal.vue'
import { useHrOperations } from '../composables/useHrOperations'
import { useAuth } from '../composables/useAuth'
import type {
  HrOperation,
  HrOperationSave,
  ApprovalStatus,
  ActiveStatus,
} from '../entities/hrOperation'
import { Icon } from '@iconify/vue'

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

watch(
  () => currentUser.value?.id_role,
  (role) => {
    approvalFilter.value = role === 3 ? 'pending' : 'approved'
  },
)

const currentList = computed(() => (showDeleted.value ? deletedList.value : actualList.value))

const organizations = computed(() => {
  const names = currentList.value.map((op) => op.organization_name).filter(Boolean)
  return [...new Set(names)]
})

const filtered = computed(() => {
  let list = currentList.value

  list = list.filter((op) => op.approval_status === approvalFilter.value)

  if (showOnlyInactive.value) {
    if (approvalFilter.value !== 'approved') {
      return []
    }
    list = list.filter((op) => op.active_status === 'dismissed')
  } else if (approvalFilter.value === 'approved' && !showDeleted.value) {
    list = list.filter((op) => op.active_status !== 'dismissed')
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

const rejectModal = reactive<{
  visible: boolean
  row: HrOperation | null
}>({
  visible: false,
  row: null,
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

function closeRejectModal() {
  rejectModal.visible = false
  rejectModal.row = null
}

async function saveForm(payload: HrOperationSave) {
  await saveOperation(payload)
  closeForm()
}

async function approveRow(row: HrOperation) {
  await approveOperation(row.id_hr_operation)
}

function rejectRow(row: HrOperation) {
  rejectModal.row = row
  rejectModal.visible = true
}

async function submitReject(reason: string | null) {
  if (!rejectModal.row) return
  await rejectOperation(rejectModal.row.id_hr_operation, reason)
  closeRejectModal()
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

const exportError = ref('')

function getApprovalText(s: ApprovalStatus): string {
  if (s === 'approved') return 'Одобренные'
  if (s === 'pending') return 'На рассмотрении'
  return 'Отклоненные'
}

function getActiveStatusText(s: ActiveStatus): string {
  if (s === 'active') return 'Работает'
  if (s === 'applicant') return 'Соискатель'
  return 'Уволен'
}

function formatDate(val: unknown) {
  if (!val) return ''
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? String(val) : d.toLocaleString('ru-RU')
}

async function exportExcel() {
  exportError.value = ''

  const rows = filtered.value
  if (!rows.length) {
    exportError.value = 'Нет данных для выгрузки в файл'
    return
  }

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('HR operations')

  const filterHeader = [
    'Организация',
    'Статус операций',
    'Уволенные сотрудники',
    'Удаленные операции',
  ]
  const filterValues = [
    selectedOrganization.value ? selectedOrganization.value : 'Все организации',
    getApprovalText(approvalFilter.value),
    showOnlyInactive.value ? 'Да' : 'Нет',
    showDeleted.value ? 'Да' : 'Нет',
  ]

  const filterHeaderRow = ws.addRow(filterHeader)
  filterHeaderRow.font = { bold: true }
  ws.addRow(filterValues)
  ws.addRow([])

  const header = ['ФИО', 'Организация', 'Отдел', 'Должность', 'Зарплата', 'Статус']

  const includeReason = approvalFilter.value === 'rejected'
  const includeDeletedAt = showDeleted.value

  if (includeReason) header.push('Причина отклонения')
  if (includeDeletedAt) header.push('Время удаления')

  const tableHeaderRowIndex = ws.rowCount + 1
  const tableHeaderRow = ws.addRow(header)
  tableHeaderRow.font = { bold: true }

  rows.forEach((op) => {
    const rowArr: (string | number)[] = [
      op.employee_name ?? '',
      op.organization_name ?? '',
      op.department_name ?? '',
      op.position_name ?? '',
      op.salary ?? '',
      getActiveStatusText(op.active_status),
    ]

    if (includeReason) rowArr.push(op.reject_reason?.trim() ? op.reject_reason : '-')
    if (includeDeletedAt) rowArr.push(formatDate(op.deleted_at))

    ws.addRow(rowArr)
  })

  const colCount = ws.columnCount

  for (let c = 1; c <= colCount; c++) {
    let max = 10

    ws.eachRow({ includeEmpty: true }, (row) => {
      const cell = row.getCell(c)
      const v = cell.value
      const len = v == null ? 0 : String(v).length
      if (len > max) max = len
    })

    const col = ws.getColumn(c)
    col.width = Math.min(Math.max(max + 2, 12), 60)
  }

  if (isDirector.value && approvalFilter.value === 'pending') {
    const yellowFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2CC' },
    }

    const deptCol = 3
    const posCol = 4
    const salaryCol = 5
    const statusCol = 6

    const firstDataRow = tableHeaderRowIndex + 1

    rows.forEach((op, i) => {
      const excelRowIndex = firstDataRow + i
      const changed = getChangedFields(op.id_hr_operation)
      const rowRef = ws.getRow(excelRowIndex)

      if (op.active_status === 'applicant') {
        rowRef.getCell(statusCol).fill = yellowFill
        return
      }

      if (changed.has('id_department')) rowRef.getCell(deptCol).fill = yellowFill
      if (changed.has('id_position')) rowRef.getCell(posCol).fill = yellowFill
      if (changed.has('salary')) rowRef.getCell(salaryCol).fill = yellowFill
      if (changed.has('active_status')) rowRef.getCell(statusCol).fill = yellowFill
    })
  }

  const fileName = `hr_operations_${approvalFilter.value}_${new Date().toISOString().slice(0, 10)}.xlsx`

  const buffer = await wb.xlsx.writeBuffer()
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    fileName,
  )
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

.export-btn {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #aaa;
  border-radius: 8px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.15s;
}

.export-btn:hover {
  background: #f5f5f5;
}

.export-btn :deep(svg) {
  flex-shrink: 0;
}

.export-text {
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  margin-top: 1px;
}
</style>
