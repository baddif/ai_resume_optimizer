module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/tests/frontend'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/frontend/setupTests.js'],
  testEnvironment: 'jsdom',
};
