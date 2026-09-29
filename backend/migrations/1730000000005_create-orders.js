exports.up = (pgm) => {
  // Pedido con snapshot de la información de entrega (independiente de la cuenta del cliente)
  // y de los totales (subtotal + despacho = total). payment_method / payment_status separados.
  pgm.sql(`
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
      subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
      delivery_fee DECIMAL(10,2) NOT NULL CHECK (delivery_fee >= 0),
      total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
      payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash','transfer')),
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid')),
      delivery_name VARCHAR(150) NOT NULL,
      delivery_phone VARCHAR(50) NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_commune VARCHAR(100),
      delivery_instructions TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  // Snapshot histórico: conserva product_name, unit_price y las opciones (JSONB)
  // para que el pedido no cambie si el producto o sus precios cambian mañana.
  pgm.sql(`
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name VARCHAR(150) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      options JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  pgm.sql('CREATE INDEX idx_order_items_order_id ON order_items(order_id)')
}

exports.down = (pgm) => {
  pgm.sql('DROP TABLE order_items')
  pgm.sql('DROP TABLE orders')
}
