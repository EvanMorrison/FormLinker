module.exports = {
  "extends": "standard",
  "plugins": [
    "babel", "standard", "node", "import", "promise"
  ],
  "parser": "babel-eslint",
  "rules": {
    "no-unused-expressions": 0,
    "babel/no-unused-expressions": ["error", {allowTernary: true}],
    "space-before-function-paren": ["error", "never"],
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "keyword-spacing": ["error", {"before": true, "after": false, "overrides": {"else": {"after": true}, "from": {"after": true}, "import": {"after": true}, "case": {"after": true}}}],
    "space-unary-ops": [2, {"words": true, "nonwords": false, "overrides": {"typeof": false}}]
  }
};
