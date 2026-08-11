module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|expo|expo-.*|@expo/.*|expo-router|nativewind|react-native-reanimated|react-native-worklets|@react-native-async-storage)/)"
  ]
};
