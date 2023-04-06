const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:1234",
    specPattern: ["e2e/*.cy.*"],
    supportFile: false,
    chromeWebSecurity: false,
    env: {
      seed: "give laugh youth nice fossil common neutral since best biology swift unhappy",
    },
  },
});
