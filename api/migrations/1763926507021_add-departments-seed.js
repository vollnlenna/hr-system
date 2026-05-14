/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ООО Альфа', 1, null),
      ('IT департамент', 1, 1),
      ('Backend разработка', 1, 2),
      ('Frontend разработка', 1, 2),
      ('Mobile разработка', 1, 2),
      ('QA отдел', 1, 2),
      ('DevOps отдел', 1, 2),
      ('HR отдел', 1, 1),
      ('Финансовый отдел', 1, 1),
      ('Юридический отдел', 1, 1);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ООО Альфа Ярославль', 2, null),
      ('IT департамент', 2, 11),
      ('Backend разработка', 2, 12),
      ('Frontend разработка', 2, 12),
      ('Техническая поддержка', 2, 12),
      ('HR отдел', 2, 11),
      ('Финансовый отдел', 2, 11),
      ('Юридический отдел', 2, 11);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ООО Альфа Санкт-Петербург', 3, null),
      ('IT департамент', 3, 19),
      ('Mobile разработка', 3, 20),
      ('QA отдел', 3, 20),
      ('DevOps отдел', 3, 20),
      ('HR отдел', 3, 19),
      ('Финансовый отдел', 3, 19),
      ('Юридический отдел', 3, 19);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ООО Альфа Казань', 4, null),
      ('IT департамент', 4, 27),
      ('Backend разработка', 4, 28),
      ('Data Engineering', 4, 28),
      ('Business Analytics', 4, 28),
      ('HR отдел', 4, 27),
      ('Финансовый отдел', 4, 27);

    insert into departments (name, id_organization, id_parent_department) values
      ('Руководство ООО Альфа Новосибирск', 5, null),
      ('IT департамент', 5, 34),
      ('Frontend разработка', 5, 35),
      ('UI/UX Design', 5, 35),
      ('Техническая поддержка', 5, 35),
      ('HR отдел', 5, 34),
      ('Финансовый отдел', 5, 34);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from departments;`);
};
