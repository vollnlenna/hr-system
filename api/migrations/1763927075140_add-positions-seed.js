/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into positions (name)
    values
      ('Генеральный директор'),
      ('Технический директор'),
      ('Руководитель команды'),
      ('Руководитель проектов'),
      ('Продакт-менеджер'),
      ('Backend-разработчик'),
      ('Frontend-разработчик'),
      ('Mobile-разработчик'),
      ('QA-инженер'),
      ('DevOps-инженер'),
      ('Системный администратор'),
      ('Бизнес-аналитик'),
      ('Инженер данных'),
      ('UI/UX дизайнер'),
      ('HR-менеджер'),
      ('Рекрутер'),
      ('Бухгалтер'),
      ('Юрист'),
      ('Инженер технической поддержки'),
      ('Специалист по информационной безопасности'),
      ('Администратор HR-системы'),
      ('HR-руководитель');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from positions;`);
};
