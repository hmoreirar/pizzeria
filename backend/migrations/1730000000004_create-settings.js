exports.up = (pgm) => {
  // Configuración del sistema como pares clave/valor.
  // El costo de despacho es fijo y configurable; se guarda acá, no en el frontend.
  pgm.sql(`
    CREATE TABLE settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  // Valor inicial del costo de despacho (CLP, sin decimales).
  pgm.sql(`INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')`)
}

exports.down = (pgm) => {
  pgm.sql('DROP TABLE settings')
}
