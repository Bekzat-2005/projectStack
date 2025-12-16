import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],

  moduleFileExtensions: ["ts", "js"],

  collectCoverage: false // ⛔ УАҚЫТША ӨШІРІЛДІ
};

export default config;
