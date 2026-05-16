import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ChangeHistoryService } from '../change-history/change-history.service';
import { logEntityChanges } from '../change-history/log-change';

export interface HrOperation {
  id_hr_operation: number;
  id_employee: number;
  id_department: number;
  id_position: number;
  salary: number;
  active_status: 'applicant' | 'active' | 'dismissed';
  reject_reason?: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  employee_name?: string;
  organization_name?: string;
  department_name?: string;
  position_name?: string;

  [key: string]: unknown;
}

interface HistoryRow {
  changed_at: Date;
  field_name: string | null;
  old_value: string | null;
}

@Injectable()
export class HrOperationsService {
  constructor(
    @Inject('PG_POOL') private readonly pgPool: Pool,
    private readonly history: ChangeHistoryService,
  ) {}

  async getAll(): Promise<HrOperation[]> {
    const query = `
      select
        op.*,
        concat(e.last_name, ' ', e.first_name, ' ', coalesce(e.middle_name, '')) as employee_name,
        o.name as organization_name,
        d.name as department_name,
        p.name as position_name
      from hr_operations op
             left join employees e on e.id_employee = op.id_employee and e.deleted_at is null
             left join departments d on d.id_department = op.id_department and d.deleted_at is null
             left join organizations o on o.id_organization = d.id_organization and o.deleted_at is null
             left join positions p on p.id_position = op.id_position and p.deleted_at is null
      where op.deleted_at is null
      order by op.id_hr_operation desc
    `;

    const result: QueryResult<HrOperation> = await this.pgPool.query(query);
    return result.rows;
  }

  async getDeleted(): Promise<HrOperation[]> {
    const query = `
      select
        op.*,
        concat(e.last_name, ' ', e.first_name, ' ', coalesce(e.middle_name, '')) as employee_name,
        o.name as organization_name,
        d.name as department_name,
        p.name as position_name
      from hr_operations op
             left join employees e on e.id_employee = op.id_employee and e.deleted_at is null
             left join departments d on d.id_department = op.id_department and d.deleted_at is null
             left join organizations o on o.id_organization = d.id_organization and o.deleted_at is null
             left join positions p on p.id_position = op.id_position and p.deleted_at is null
      where op.deleted_at is not null
      order by op.id_hr_operation desc
    `;

    const result: QueryResult<HrOperation> = await this.pgPool.query(query);
    return result.rows;
  }

  async getById(id: number): Promise<HrOperation | null> {
    const query = `
      select
        op.*,
        concat(e.last_name, ' ', e.first_name, ' ', coalesce(e.middle_name, '')) as employee_name,
        o.name as organization_name,
        d.name as department_name,
        p.name as position_name
      from hr_operations op
             left join employees e on e.id_employee = op.id_employee and e.deleted_at is null
             left join departments d on d.id_department = op.id_department and d.deleted_at is null
             left join organizations o on o.id_organization = d.id_organization and o.deleted_at is null
             left join positions p on p.id_position = op.id_position and p.deleted_at is null
      where op.id_hr_operation = $1
    `;

    const result: QueryResult<HrOperation> = await this.pgPool.query(query, [
      id,
    ]);
    return result.rows[0] ?? null;
  }

  async create(
    data: {
      id_employee: number;
      id_department: number;
      id_position: number;
      salary: number;
    },
    id_user: number,
  ): Promise<HrOperation> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `
        insert into hr_operations (
          id_employee,
          id_department,
          id_position,
          salary,
          active_status,
          approval_status,
          reject_reason,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, 'applicant', 'pending', null, now(), now())
          returning *
      `,
      [data.id_employee, data.id_department, data.id_position, data.salary],
    );

    const created = result.rows[0];

    await logEntityChanges(this.history, {
      entity: 'hr_operation',
      oldRow: {} as HrOperation,
      newRow: created,
      id_user,
    });

    return created;
  }

  async update(
    id: number,
    data: {
      id_department?: number;
      id_position?: number;
      salary?: number;
      active_status?: 'applicant' | 'active' | 'dismissed';
    },
    id_user: number,
  ): Promise<HrOperation | null> {
    const oldRow = await this.getById(id);

    if (!oldRow) return null;

    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `
        update hr_operations
        set
          id_department = coalesce($2, id_department),
          id_position = coalesce($3, id_position),
          salary = coalesce($4, salary),
          active_status = coalesce($5, active_status),
          approval_status = 'pending',
          reject_reason = null,
          updated_at = now()
        where id_hr_operation = $1
          returning *
      `,
      [
        id,
        data.id_department,
        data.id_position,
        data.salary,
        data.active_status,
      ],
    );

    const newRow = result.rows[0];

    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'hr_operation',
        oldRow,
        newRow,
        id_user,
      });
    }

    return newRow ?? null;
  }

  async approve(id: number): Promise<HrOperation | null> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `
        update hr_operations
        set
          approval_status = 'approved',
          active_status = case
            when active_status = 'applicant'
              then 'active'
            else active_status
            end,
          reject_reason = null,
          updated_at = now()
        where id_hr_operation = $1
          returning *
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async reject(id: number, reason: string | null): Promise<HrOperation | null> {
    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `
        update hr_operations
        set
          approval_status = 'rejected',
          reject_reason = $2,
          updated_at = now()
        where id_hr_operation = $1
          returning *
      `,
      [id, reason],
    );

    return result.rows[0] ?? null;
  }

  async delete(id: number, id_user: number): Promise<HrOperation | null> {
    const oldRow = await this.getById(id);

    if (!oldRow) return null;

    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations
       set deleted_at = now()
       where id_hr_operation = $1
         returning *`,
      [id],
    );

    const newRow = result.rows[0];

    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'hr_operation',
        oldRow,
        newRow,
        id_user,
      });
    }

    return newRow ?? null;
  }

  async restore(id: number, id_user: number): Promise<HrOperation | null> {
    const oldRow = await this.getById(id);

    if (!oldRow) return null;

    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations
       set deleted_at = null
       where id_hr_operation = $1
         and deleted_at is not null
         returning *`,
      [id],
    );

    const newRow = result.rows[0];

    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'hr_operation',
        oldRow,
        newRow,
        id_user,
      });
    }

    return newRow ?? null;
  }

  async revertToApproved(
    id: number,
    id_user: number,
  ): Promise<HrOperation | null> {
    const historyResult = await this.pgPool.query<HistoryRow>(
      `select changed_at, field_name, old_value from change_history
       where id_hr_operation = $1
       order by changed_at desc`,
      [id],
    );

    const history = historyResult.rows;

    if (!history.length) {
      return null;
    }

    const SKIP_FIELDS = new Set([
      'approval_status',
      'deleted_at',
      'created_at',
      'updated_at',
      'reject_reason',
    ]);

    const meaningfulHistory = history.filter(
      (h) => h.field_name && !SKIP_FIELDS.has(h.field_name),
    );

    if (!meaningfulHistory.length) {
      return null;
    }

    const firstRow = meaningfulHistory[0];

    if (!firstRow) {
      return null;
    }

    const lastTime = new Date(firstRow.changed_at).getTime();

    const lastBatch = meaningfulHistory.filter(
      (h) => Math.abs(new Date(h.changed_at).getTime() - lastTime) < 1000,
    );

    const oldValues: Record<string, string | null> = {};
    for (const h of lastBatch) {
      if (h.field_name && h.old_value != null) {
        oldValues[h.field_name] = h.old_value;
      }
    }

    const oldRow = await this.getById(id);
    if (!oldRow) return null;

    const result: QueryResult<HrOperation> = await this.pgPool.query(
      `update hr_operations
       set
         id_department   = coalesce($2, id_department),
         id_position     = coalesce($3, id_position),
         salary          = coalesce($4, salary),
         active_status   = coalesce($5, active_status),
         approval_status = 'approved',
         reject_reason   = null,
         updated_at      = now()
       where id_hr_operation = $1
         returning *`,
      [
        id,
        oldValues['id_department'] ?? null,
        oldValues['id_position'] ?? null,
        oldValues['salary'] ?? null,
        oldValues['active_status'] ?? null,
      ],
    );

    const newRow = result.rows[0];

    if (newRow) {
      await logEntityChanges(this.history, {
        entity: 'hr_operation',
        oldRow,
        newRow,
        id_user,
      });
    }

    return newRow ?? null;
  }
}
