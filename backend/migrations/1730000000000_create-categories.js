exports.up = (pgm) => {
  // `name UNIQUE` evita dos categorías con el mismo nombre.
  // `TIMESTAMPTZ` guarda la fecha con zona horaria (hora absoluta real).
  pgm.sql(`
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

exports.down = (pgm) => {
  pgm.sql('DROP TABLE categories')
}
