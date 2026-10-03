exports.up = (pgm) => {
  // Actualiza el catálogo placeholder en inglés + imágenes locales reales.
  // UPDATE en sitio (no TRUNCATE): preserva pedidos existentes.
  // Se aplica tanto en dev como en prod vía `migrate`.
  // IDs estables: el seed inserta categorías/productos con id explícito.

  // Categorías: español -> inglés.
  pgm.sql(`UPDATE categories SET name = 'Sides'  WHERE id = 3`)
  pgm.sql(`UPDATE categories SET name = 'Drinks' WHERE id = 4`)
  pgm.sql(`UPDATE categories SET name = 'Deals'  WHERE id = 5`)

  // Productos: nombre/descripción en inglés + imagen local real.
  pgm.sql(`
    UPDATE products SET
      name = 'Margherita Pizza (demo)',
      description = 'Tomato sauce, mozzarella and fresh basil.',
      image = '/images/margherita.jpg'
    WHERE id = 1
  `)
  pgm.sql(`
    UPDATE products SET
      name = 'Pepperoni Pizza (demo)',
      description = 'Mozzarella and pepperoni with a crispy crust.',
      image = '/images/pepperoni.jpg'
    WHERE id = 2
  `)
  pgm.sql(`
    UPDATE products SET
      name = 'Family Combo (demo)',
      description = 'Large pizza + 1.5L drink.',
      image = '/images/combo.jpg'
    WHERE id = 3
  `)
  pgm.sql(`
    UPDATE products SET
      name = 'French Fries (demo)',
      description = 'Portion of salted fries.',
      image = '/images/fries.jpg'
    WHERE id = 4
  `)
  pgm.sql(`
    UPDATE products SET
      name = 'Cola 1.5L (demo)',
      description = 'Returnable 1.5 liter bottle.',
      image = '/images/cola.jpg'
    WHERE id = 5
  `)
  pgm.sql(`
    UPDATE products SET
      name = '2x1 Pizzas (demo)',
      description = 'Two large pizzas for the price of one.',
      image = '/images/promo.jpg'
    WHERE id = 6
  `)

  // Opciones de tamaño: español -> inglés.
  pgm.sql(`UPDATE options SET name = 'Large · 32 cm'  WHERE name = 'Grande · 32 cm'`)
  pgm.sql(`UPDATE options SET name = 'Family · 38 cm' WHERE name = 'Familiar · 38 cm'`)
}

exports.down = (pgm) => {
  // Reversible en esencia; los datos placeholder se restauran con `npm run seed`.
}
