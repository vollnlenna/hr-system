<template>
  <div v-if="isDirector" class="card director-card">
    <div v-if="row.approval_status === 'pending'" class="card-body director-layout">
      <div class="director-info">
        <div v-if="isCreated" class="director-created">Принятие на работу</div>

        <div class="director-title">
          {{ formatEmployeeName(row.employee_name) }}
        </div>

        <div class="director-line">
          <span> Организация: </span>
          <span>
            {{ row.organization_name || '[Не найдена]' }}
          </span>
        </div>

        <div class="director-line">
          <span> Отдел: </span>
          <span
            :class="{
              changed: isChanged('id_department'),
            }"
          >
            {{ row.department_name || '[Не найден]' }}
          </span>
        </div>

        <div class="director-line">
          <span> Должность: </span>
          <span
            :class="{
              changed: isChanged('id_position'),
            }"
          >
            {{ row.position_name || '[Не найдена]' }}
          </span>
        </div>

        <div class="director-line">
          <span> Зарплата: </span>
          <span
            :class="{
              changed: isChanged('salary'),
            }"
          >
            {{ formatCurrency(row.salary) }}
          </span>
        </div>

        <div class="director-line">
          <span> Статус: </span>
          <span
            :class="{
              changed: isChanged('active_status'),
            }"
          >
            {{ getStatusText(row.active_status) }}
          </span>
        </div>
      </div>

      <div class="director-actions">
        <button class="btn-edit" @click="$emit('approve', row)">Подтвердить</button>
        <button class="btn-delete" @click="$emit('reject', row)">Отклонить</button>
      </div>
    </div>

    <div v-else class="card-body">
      <div class="card-title">
        {{ formatEmployeeName(row.employee_name) }}
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Организация:</div>
        <div class="comment-content">
          {{ row.organization_name || '[Не найдена]' }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Отдел:</div>
        <div class="comment-content">
          {{ row.department_name || '[Не найден]' }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Должность:</div>
        <div class="comment-content">
          {{ row.position_name || '[Не найдена]' }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Зарплата:</div>
        <div class="comment-content">
          {{ formatCurrency(row.salary) }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Статус:</div>
        <div class="comment-content">
          <em :class="getStatusClass(row.active_status)">
            {{ getStatusText(row.active_status) }}
          </em>
        </div>
      </div>

      <div v-if="row.approval_status === 'rejected'" class="deleted-overlay">
        <div class="deleted-content">
          <div>Отклонено руководителем</div>
          <div v-if="row.reject_reason" class="reject-reason">
            Причина:
            {{ row.reject_reason }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="card hr-card">
    <div class="card-body">
      <div class="card-title">
        {{ formatEmployeeName(row.employee_name) }}
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Организация:</div>
        <div class="comment-content">
          {{ row.organization_name || '[Не найдена]' }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Отдел:</div>
        <div class="comment-content">
          {{ row.department_name || '[Не найден]' }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Должность:</div>
        <div class="comment-content">
          {{ row.position_name || '[Не найдена]' }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Зарплата:</div>
        <div class="comment-content">
          {{ formatCurrency(row.salary) }}
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Статус:</div>
        <div class="comment-content">
          <em :class="getStatusClass(row.active_status)">
            {{ getStatusText(row.active_status) }}
          </em>
        </div>
      </div>

      <div
        v-if="canManage && !row.deleted_at && row.approval_status === 'approved'"
        class="card-actions"
      >
        <button class="btn-edit" @click="$emit('edit', row)">Изменить</button>
        <button class="btn-delete" @click="onDelete">Удалить</button>
      </div>
    </div>

    <div v-if="row.deleted_at" class="deleted-overlay">
      <div class="deleted-content">
        <div>
          Удалено:
          {{ formatDate(row.deleted_at) }}
        </div>
        <button v-if="canManage" class="btn-restore" @click="onRestore">Восстановить</button>
      </div>
    </div>

    <div v-if="row.approval_status === 'pending' && !row.deleted_at" class="deleted-overlay">
      <div class="deleted-content">На рассмотрении руководителем</div>
    </div>

    <div v-if="row.approval_status === 'rejected' && !row.deleted_at" class="deleted-overlay">
      <div class="deleted-content">
        <div>Отклонено руководителем</div>
        <div v-if="row.reject_reason" class="reject-reason">
          Причина:
          {{ row.reject_reason }}
        </div>
        <div v-if="canManage" class="rejected-actions">
          <button v-if="!isCreated" class="btn-restore" @click="$emit('revert', row)">
            Вернуть
          </button>
          <button class="btn-delete" @click="onDelete">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HrOperation } from '@/entities/hrOperation'

const props = defineProps<{
  row: HrOperation
  isDirector: boolean
  canManage: boolean
  isCreatedOperation: (id: number) => boolean
  getChangedFields: (id: number) => Set<string>
}>()

const emit = defineEmits<{
  (e: 'edit', row: HrOperation): void
  (e: 'delete', row: HrOperation): void
  (e: 'restore', row: HrOperation): void
  (e: 'approve', row: HrOperation): void
  (e: 'reject', row: HrOperation): void
  (e: 'revert', row: HrOperation): void
}>()

const isCreated = computed(() => props.isCreatedOperation(props.row.id_hr_operation))

function isChanged(field: string): boolean {
  if (isCreated.value) {
    return false
  }
  return props.getChangedFields(props.row.id_hr_operation).has(field)
}

function onDelete() {
  if (!confirm('Удалить кадровую операцию?')) {
    return
  }
  emit('delete', props.row)
}

function onRestore() {
  if (!confirm('Восстановить кадровую операцию?')) {
    return
  }
  emit('restore', props.row)
}

function formatEmployeeName(val: unknown): string {
  if (!val || String(val).trim() === '' || val === 'null') {
    return '[Сотрудник не найден]'
  }
  return String(val)
}

function formatDate(val: unknown) {
  if (!val) return ''
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? String(val) : d.toLocaleString('ru-RU')
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(value)
}

function getStatusText(status: string): string {
  if (status === 'active') {
    return 'Работает'
  }
  if (status === 'applicant') {
    return 'Соискатель'
  }
  return 'Уволен'
}

function getStatusClass(status: string): string {
  if (status === 'active') {
    return 'status-active'
  }
  if (status === 'applicant') {
    return 'status-applicant'
  }
  return 'status-dismissed'
}
</script>

<style scoped>
.hr-card {
  height: 450px;
}

.director-card {
  width: 100%;
}

.director-layout {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  padding: 16px 20px;
}

.director-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.director-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.director-created {
  font-style: italic;
  color: #666;
  font-size: 13px;
}

.director-line {
  display: flex;
  flex-direction: row;
  gap: 6px;
  font-size: 13px;
  align-items: baseline;
}

.director-line span:first-child {
  font-weight: 700;
  white-space: nowrap;
}

.director-line span.changed {
  font-style: italic;
  color: green;
}

.director-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 10px;
  min-width: 130px;
  flex-shrink: 0;
}

.director-actions .btn-edit,
.director-actions .btn-delete {
  width: 100%;
  text-align: center;
}

.rejected-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}

.rejected-actions .btn-restore,
.rejected-actions .btn-delete {
  width: 120px;
  margin-top: 0;
}

.status-active {
  color: #666;
}

.status-applicant {
  color: #c99700;
}

.status-dismissed {
  color: red;
}

.reject-reason {
  margin-top: 10px;
  max-width: 220px;
  font-size: 13px;
  font-style: italic;
}
</style>
