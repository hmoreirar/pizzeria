exports.up = (pgm) => {
  // Traduce el catálogo placeholder al español (interfaz monolingüe).
  // UPDATE en sitio: preserva pedidos existentes.
  // Los nombres deben coincidir con backend/src/db/catalog.ts.

  // Categorías: inglés -> español.
  pgm.sql(`UPDATE categories SET name = 'Acompañamientos' WHERE id = 3`)
  pgm.sql(`UPDATE categories SET name = 'Bebidas'          WHERE id = 4`)
  pgm.sql(`UPDATE categories SET name = 'Ofertas'          WHERE id = 5`)

  // Productos: nombre y descripción en español.
  pgm.sql(`
    UPDATE products AS p
    SET name = v.name, description = v.description
    FROM (VALUES
      (1,  'Margherita',            'Tomate San Marzano, fior di mozzarella, albahaca fresca y aceite de oliva extra virgen.'),
      (2,  'Pepperoni',             'Pepperoni picante, mozzarella madurada y salsa de tomate cocida lentamente.'),
      (3,  'Combo Familia',         '2 pizzas grandes + pan de ajo + bebida de 2L.'),
      (4,  'Papas a la Trufa',      'Papas cortadas a mano, aceite de trufa, parmesano y perejil.'),
      (5,  'Cola Artesanal 1.5L',   'Cola de producción artesanal, 1,5 litros.'),
      (6,  '2x1 Pizzas',            'Dos pizzas grandes al precio de una.'),
      (7,  'Hawaiana',              'Jamón ahumado, piña caramelizada, mozzarella y tomate.'),
      (8,  'Vegetariana',           'Pimientos asados, champiñones, cebolla roja, aceitunas y mozzarella.'),
      (9,  'Carnívora',             'Pepperoni, salchicha, tocino, jamón y mozzarella.'),
      (10, 'Pollo BBQ',             'Pollo a la parrilla, salsa BBQ ahumada, cebolla roja y cilantro.'),
      (11, 'Pan de Ajo',            'Baguette al horno de leña, mantequilla de ajo asado y hierbas.'),
      (12, 'Alitas Búfalo',         'Alitas picantes con salsa búfalo y dip de queso azul.'),
      (13, 'Aros de Cebolla',       'Aros de cebolla rebozados en cerveza con mayonesa chipotle.'),
      (14, 'Agua con Gas 500ml',    'Agua mineral con gas, bien fría.'),
      (15, 'Limonada 1L',           'Limonada casera con menta.'),
      (16, 'Jugo de Naranja',       'Jugo de naranja prensado en frío.'),
      (17, 'Combo Pareja',          '1 pizza grande + pan de ajo + 2 bebidas.'),
      (18, 'Almuerzo Express',      'Pizza personal + ensalada + bebida.')
    ) AS v(id, name, description)
    WHERE p.id = v.id
  `)

  // Opciones de tamaño: grupo y valores en español.
  pgm.sql(`UPDATE option_groups SET name = 'Tamaño' WHERE name = 'Size'`)
  pgm.sql(`UPDATE options SET name = 'Grande · 32 cm'   WHERE name = 'Large · 32 cm'`)
  pgm.sql(`UPDATE options SET name = 'Familiar · 38 cm' WHERE name = 'Family · 38 cm'`)
}

exports.down = (pgm) => {
  // Reversible en esencia; los datos placeholder se restauran con `npm run seed`.
}
