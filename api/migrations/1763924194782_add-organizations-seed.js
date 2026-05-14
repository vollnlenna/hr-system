/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    insert into organizations (name, comment)
    values
      ('ООО Альфа', 'Головная IT-компания'),
      ('ООО Альфа Ярославль', 'Филиал в Ярославле'),
      ('ООО Альфа Санкт-Петербург', 'Филиал в Санкт-Петербурге'),
      ('ООО Альфа Казань', 'Филиал в Казани'),
      ('ООО Альфа Новосибирск', 'Филиал в Новосибирске');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`delete from organizations;`);
};
