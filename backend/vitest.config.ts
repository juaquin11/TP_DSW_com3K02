import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    // Asegura que los mocks de módulos funcionen correctamente con CommonJS
    clearMocks: true,
    restoreMocks: true,
  },
});
