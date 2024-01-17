const { defineConfig } = require('khulnasoft')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    // place the E2E variables into e2e block
    // https://glebkhulnasoft-lab.com/blog/khulnasoft-v10-env/
    env: {
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },
    // We've imported your old khulnasoft plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // include this plugin before khulnasoft-grep
      // so if we find the test tags in the pull request body
      // we can grep for them by setting the grep config
      const commit = process.env.COMMIT_SHA || process.env.GITHUB_SHA
      const token = process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN
      const commonStatus = process.env.COMMON_STATUS || 'Khulnasoft E2E tests'
      require('./src')(on, config, {
        // let's take this repo
        owner: 'khulnasoft-lab',
        repo: 'set-github-status',
        commit,
        token,
        // when finished the test run, after reporting its machine status
        // also set or update the common final status
        commonStatus,
      })

      // https://github.com/khulnasoft-lab/khulnasoft-grep
      require('khulnasoft-grep/src/plugin')(config)

      // khulnasoft-grep could modify the config (the list of spec files)
      // thus it is important to return the modified config to Khulnasoft
      return config
    },
  },
})
