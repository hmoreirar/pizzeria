exports.up = (pgm) => {
  // Un producto configurable (ej. pizza) tiene grupos de opciones (Tamaño, Extras…)
  // y cada grupo tiene opciones (Grande·32cm, Familiar·38cm…).
  // min_select/max_select controlan cuántas opciones puede elegir el cliente por grupo:
  //   - Tamaño: min_select=1, max_select=1 (obligatorio, una sola)
  //   - Extras: min_select=0, max_select=N (opcional, varias)
  pgm.sql(`
    CREATE TABLE option_groups (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      min_select INTEGER NOT NULL DEFAULT 0 CHECK (min_select >= 0),
      max_select INTEGER NOT NULL DEFAULT 1 CHECK (max_select >= min_select),
      sort_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  pgm.sql('CREATE INDEX idx_option_groups_product_id ON option_groups(product_id)')

  // price_delta es el sobreprecio que suma al precio base del producto.
  // 0 significa "sin recargo" (ej. tamaño Grande).
  pgm.sql(`
    CREATE TABLE options (
      id SERIAL PRIMARY KEY,
      option_group_id INTEGER NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      price_delta DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price_delta >= 0),
      sort_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  pgm.sql('CREATE INDEX idx_options_option_group_id ON options(option_group_id)')
}

exports.down = (pgm) => {
  pgm.sql('DROP TABLE options')
  pgm.sql('DROP TABLE option_groups')
}
