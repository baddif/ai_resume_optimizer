import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'assets',  // 直接打包到插件的assets目录
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.jsx'),
      output: {
        entryFileNames: 'main.js',
        assetFileNames: 'style.css',
        format: 'iife',
        external: ['@wordpress/i18n'],
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/i18n': 'wp.i18n',
          '@reduxjs/toolkit': 'RTK',
          'react-redux': 'ReactRedux',
          'redux-persist': 'ReduxPersist'
        }
      }
    },
    cssCodeSplit: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});
