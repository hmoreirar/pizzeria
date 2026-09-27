exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name VARCHAR(150) NOT NULL,
      description TEXT,
      image TEXT,
      price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  // Índice para filtrar productos por categoría de forma eficiente.
  pgm.sql('CREATE INDEX idx_products_category_id ON products(category_id)')
}

exports.down = (pgm) => {
  pgm.sql('DROP TABLE products')
}
