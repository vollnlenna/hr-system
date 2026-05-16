/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable('hr_operations', {
    id_hr_operation: {
      type: 'serial',
      primaryKey: true,
    },
    id_employee: {
      type: 'integer',
      notNull: true,
      references: '"employees"',
      onDelete: 'cascade',
    },
    id_department: {
      type: 'integer',
      notNull: true,
      references: '"departments"',
      onDelete: 'cascade',
    },
    id_position: {
      type: 'integer',
      notNull: true,
      references: '"positions"',
      onDelete: 'cascade',
    },
    active_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'applicant',
    },
    reject_reason: {
      type: 'text',
    },
    approval_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
    },
    salary: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp',
    },
    deleted_at: {
      type: 'timestamp',
    },
  });

  pgm.addConstraint(
    'hr_operations',
    'hr_operations_approval_status_check',
    `
      CHECK (
        approval_status IN (
          'pending',
          'approved',
          'rejected'
        )
      )
    `,
  );
  pgm.addConstraint(
    'hr_operations',
    'hr_operations_active_status_check',
    `
    CHECK (
      active_status IN (
        'applicant',
        'active',
        'dismissed'
      )
    )
  `,
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropTable('hr_operations');
};
