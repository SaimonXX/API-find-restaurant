'use strict'

const { pathsToModuleNameMapper } = require('ts-jest')
const tsconfigData = require('./tsconfig.json')

const compilerPaths = tsconfigData.compilerOptions.paths

const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json'
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',

    ...(compilerPaths
      ? pathsToModuleNameMapper(compilerPaths, {
        prefix: '<rootDir>/',
        useESM: true
      })
      : {
          '^@src/(.*)\\.js$': '<rootDir>/src/$1.ts',
          '^@config/(.*)\\.js$': '<rootDir>/src/config/$1.ts',
          '^@core/(.*)\\.js$': '<rootDir>/src/core/$1.ts',
          '^@modules/(.*)\\.js$': '<rootDir>/src/modules/$1.ts'
        })
  },

  testMatch: ['**/tests/**/*.test.ts'],
  clearMocks: true,
  setupFilesAfterEnv: ['./tests/setup/jest.setup.ts'],
  forceExit: true,
  detectOpenHandles: true
}

module.exports = config
