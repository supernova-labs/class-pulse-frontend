import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", { jsc: { transform: { react: { runtime: "automatic" } } } }],
  },
  moduleNameMapper: {
    "\\.css$": "identity-obj-proxy",
    "^(\\.{1,2}/)+appConfig$": "<rootDir>/src/appConfig.test-stub.ts",
  },
};

export default config;
