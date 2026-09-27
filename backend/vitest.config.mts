import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Los tests comparten la misma BD de prueba, así que los corremos de a un
    // archivo por vez para que los TRUNCATE no se pisen entre sí.
    fileParallelism: false,
  },
})
