exports.up = (pgm) => {
  // Usuarios. Por ahora solo el administrador; las cuentas de cliente
  // llegarán en la fase de cuentas (Fase 7).
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(200) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','customer')),
      name VARCHAR(150) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

exports.down = (pgm) => {
  pgm.sql('DROP TABLE users')
}
