module.exports = {
  projects: [
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/tests/frontend'],
      setupFilesAfterEnv: ['<rootDir>/tests/frontend/setup.ts']
    },
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests/backend']
    }
  ]
};
