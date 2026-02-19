/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/pages/_*.{js,jsx,ts,tsx}",
    "!src/types/**/*",
    "!src/lib/prisma.ts",
    "!src/lib/redis.ts",
    "!src/lib/s3.ts",
    "!src/lib/email.ts",
    "!src/lib/secrets.ts",
    "!src/app/**/route.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/page.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testMatch: [
    "**/__tests__/**/*.(spec|test).{js,jsx,ts,tsx}",
    "**/?(*.)(spec|test).{js,jsx,ts,tsx}",
  ],
};

module.exports = config;
