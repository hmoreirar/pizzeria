exports.up = (pgm) => {
  // active: permite desactivar una categoría sin borrarla (deja de mostrarse al cliente).
  // sort_order: controla el orden visual de la navegación.
  pgm.sql(`
    ALTER TABLE categories
      ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0
  `)
}

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE categories
      DROP COLUMN active,
      DROP COLUMN sort_order
  `)
}
