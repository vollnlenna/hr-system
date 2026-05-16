export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ActiveStatus = 'applicant' | 'active' | 'dismissed'

export interface HrOperation {
  id_hr_operation: number
  id_employee: number
  id_department: number
  id_position: number
  active_status: ActiveStatus
  reject_reason?: string | null
  approval_status: ApprovalStatus
  salary: number
  created_at: Date
  updated_at?: Date | null
  deleted_at?: Date | null

  employee_name?: string
  organization_name?: string
  department_name?: string
  position_name?: string
}

export interface HrOperationSave {
  id_hr_operation?: number | null
  id_employee?: number
  id_department?: number
  id_position?: number
  salary?: number
  active_status?: ActiveStatus
}
