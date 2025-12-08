module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.cargo/",
    "/.pub-cache/"
  ],
  modulePathIgnorePatterns: [
    "/.cargo/",
    "/.pub-cache/"
  ]
};