import { ref, computed } from 'vue'
import http from '../api/http'
import type { HrOperation, HrOperationSave } from '../entities/hrOperation'
import type { ChangeHistory } from '../entities/changeHistory'

const SKIP_FIELDS = new Set(['approval_status', 'deleted_at', 'created_at', 'updated_at'])

export function useHrOperations() {
  const actualList = ref<HrOperation[]>([])
  const deletedList = ref<HrOperation[]>([])
  const diffMap = ref<Map<number, ChangeHistory[]>>(new Map())

  const loadOperations = async () => {
    const [actualRes, deletedRes] = await Promise.all([
      http.get<HrOperation[]>('/hr-operations'),
      http.get<HrOperation[]>('/hr-operations/deleted'),
    ])
    actualList.value = actualRes.data
    deletedList.value = deletedRes.data
  }

  const loadDiff = async (id: number) => {
    const res = await http.get<ChangeHistory[]>(`/hr-operations/${id}/history`)
    diffMap.value.set(id, res.data)
  }

  const loadPendingDiffs = async () => {
    const needDiff = actualList.value.filter(
      (op) => op.approval_status === 'pending' || op.approval_status === 'rejected',
    )
    await Promise.all(needDiff.map((op) => loadDiff(op.id_hr_operation)))
  }

  const reloadAll = async () => {
    await loadOperations()
    await loadPendingDiffs()
  }

  const isCreatedOperation = (id: number): boolean => {
    const history = diffMap.value.get(id) ?? []
    if (!history.length) {
      return false
    }
    const meaningfulHistory = history.filter((h) => h.field_name && !SKIP_FIELDS.has(h.field_name))
    if (!meaningfulHistory.length) {
      return false
    }
    return meaningfulHistory.every((h) => h.old_value == null)
  }

  const getChangedFields = (id: number): Set<string> => {
    const history = diffMap.value.get(id) ?? []
    if (!history.length) {
      return new Set()
    }

    const first = history[0]
    if (!first) {
      return new Set()
    }
    const lastTime = new Date(first.changed_at).getTime()

    const lastBatch = history.filter(
      (h) =>
        Math.abs(new Date(h.changed_at).getTime() - lastTime) < 1000 &&
        h.field_name != null &&
        !SKIP_FIELDS.has(h.field_name),
    )

    return new Set(lastBatch.map((h) => h.field_name!))
  }

  const saveOperation = async (payload: HrOperationSave) => {
    const body = {
      id_employee: payload.id_employee,
      id_department: payload.id_department,
      id_position: payload.id_position,
      salary: payload.salary,
      ...(payload.id_hr_operation
        ? {
            active_status: payload.active_status,
          }
        : {}),
    }
    if (payload.id_hr_operation) {
      await http.patch(`/hr-operations/${payload.id_hr_operation}`, body)
    } else {
      await http.post('/hr-operations', body)
    }
    await reloadAll()
  }

  const approveOperation = async (id: number) => {
    await http.patch(`/hr-operations/${id}/approve`)
    await reloadAll()
  }

  const rejectOperation = async (id: number, reason: string | null) => {
    await http.patch(`/hr-operations/${id}/reject`, { reason })

    await reloadAll()
  }

  const deleteOperation = async (id: number) => {
    await http.delete(`/hr-operations/${id}`)
    await reloadAll()
  }

  const restoreOperation = async (id: number) => {
    await http.patch(`/hr-operations/restore/${id}`)
    await reloadAll()
  }

  const revertOperation = async (id: number) => {
    await http.patch(`/hr-operations/${id}/revert`)
    await reloadAll()
  }

  return {
    actualList: computed(() => actualList.value),
    deletedList: computed(() => deletedList.value),
    loadOperations,
    loadPendingDiffs,
    reloadAll,
    isCreatedOperation,
    getChangedFields,
    saveOperation,
    approveOperation,
    rejectOperation,
    deleteOperation,
    restoreOperation,
    revertOperation,
  }
}
