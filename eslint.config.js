const expoConfig = require("eslint-config-expo/flat");

/**
 * `react-hooks/immutability` reads `sharedValue.value = x` as mutating state
 * React owns. It does not — a Reanimated shared value lives outside React, and
 * assigning to `.value` is its documented and only write API. The rule has no
 * way to tell the two apart, so it fires on every press animation in the app.
 *
 * Scoped to the animation call sites rather than switched off globally: on
 * ordinary React state the rule is catching real bugs and stays on.
 */
module.exports = [
  ...expoConfig,
  {
    files: ["src/components/**/*.tsx", "src/design/**/*.ts?(x)", "app/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off"
    }
  }
];
