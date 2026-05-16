/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into hr_operations (
      id_employee,
      id_department,
      id_position,
      salary,
      active_status,
      approval_status,
      created_at,
      updated_at
    )
    values
      (1, 1, 1, 350000.00, 'active', 'approved', now(), now()),
      (6, 3, 6, 220000.00, 'active', 'approved', now(), now()),
      (11, 4, 7, 210000.00, 'active', 'approved', now(), now()),
      (16, 6, 9, 180000.00, 'active', 'approved', now(), now()),
      (2, 12, 3, 170000.00, 'active', 'approved', now(), now()),
      (7, 13, 6, 165000.00, 'active', 'approved', now(), now()),
      (12, 14, 7, 160000.00, 'active', 'approved', now(), now()),
      (17, 15, 19, 120000.00, 'active', 'approved', now(), now()),
      (3, 20, 2, 260000.00, 'active', 'approved', now(), now()),
      (8, 21, 8, 190000.00, 'active', 'approved', now(), now()),
      (13, 22, 9, 175000.00, 'active', 'approved', now(), now()),
      (18, 23, 10, 230000.00, 'active', 'approved', now(), now()),
      (4, 28, 4, 240000.00, 'active', 'approved', now(), now()),
      (9, 29, 13, 200000.00, 'active', 'approved', now(), now()),
      (14, 30, 12, 185000.00, 'active', 'approved', now(), now()),
      (19, 29, 6, 175000.00, 'dismissed', 'approved', now(), now()),
      (5, 35, 5, 250000.00, 'active', 'approved', now(), now()),
      (10, 37, 14, 170000.00, 'active', 'approved', now(), now()),
      (15, 38, 19, 115000.00, 'active', 'approved', now(), now()),
      (20, 35, 20, 160000.00, 'active', 'approved', now(), now()),
      (21, 8, 21, 150000.00, 'active', 'approved', now(), now()),
      (22, 8, 15, 120000.00, 'active', 'approved', now(), now()),
      (23, 8, 22, 180000.00, 'active', 'approved', now(), now());
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from hr_operations;`);
};
