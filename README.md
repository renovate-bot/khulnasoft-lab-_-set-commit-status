# set-github-status ![khulnasoft version](https://img.shields.io/badge/khulnasoft-/khulnasoft-brightgreen) [![ci](https://github.com/khulnasoft-lab/set-github-status/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/khulnasoft-lab/set-github-status/actions/workflows/ci.yml)

> A little Khulnasoft plugin for setting GitHub commit status

![GitHub checks sent from the tests in another repo](./images/checks.png)

## Install

```
$ npm i -D set-github-status
# or if using Yarn
$ yarn add -D set-github-status
```

## Use

Register this plugin in your plugin file. Pick the GitHub owner and repo to send the status checks to. To pass the commit SHA you can use either an environment variable `TEST_COMMIT` or pass it via Khulnasoft `--env testCommit=...` argument. For access, use [GitHub personal token](https://github.com/settings/tokens).

### Khulnasoft v10+

Import this plugin from the config file

```js
// khulnasoft.config.js
const { defineConfig } = require('khulnasoft')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const commit = process.env.COMMIT_SHA || process.env.GITHUB_SHA
      const token = process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN
      const commonStatus = process.env.COMMON_STATUS || 'Khulnasoft E2E tests'
      require('set-github-status')(on, config, {
        owner: '...',
        repo: '...',
        commit,
        token,
        // when finished the test run, after reporting its machine status
        // also set or update the common final status
        commonStatus,
      })
    },
  },
})
```

### Khulnasoft v9

If you are using an older version of Khulnasoft, import this plugin from your plugins file

```js
// khulnasoft/plugins/index.js
module.exports = (on, config) => {
  // when we are done, post the status to GitHub
  // application repo, using the passed commit SHA
  // https://github.com/khulnasoft-lab/set-github-status
  require('set-github-status')(on, config, {
    owner: 'khulnasoft-lab',
    repo: 'todomvc-no-tests-vercel',
    commit: config.env.testCommit || process.env.TEST_COMMIT,
    token: process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
  })
}
```

## Examples

- [khulnasoft-lab/todomvc-tests-circleci](https://github.com/khulnasoft-lab/todomvc-tests-circleci)

## Bin scripts

### set-gh-status

See [bin/set-gh-status.js](./bin/set-gh-status.js) file. Typical use case

```
$ npx set-gh-status --owner <repo owner> \
  --repo <repo name> --commit <sha> \
  --status pending|success|failure|error \
  --context "short unique context" \
  --description "status description" \
  --target-url "optional URL to link to the status check"
```

**Tip:** you can specify the package name when calling `npx set-gh-status` to avoid using a wrong package:

```
$ npx --package set-github-status set-gh-status ...
```

**Tip:** you can pass both the owner and the repo in a single parameter `--repo <owner>/<repo name>`

**Tip 2:** you can set the commit status by specifying the GitHub Actions job outcome. The outcome will be remapped to the status like this: success is success, failure is failure, canceled or skipped are error. In this case, do not specify the `--status` parameter

```
$ npx set-gh-status ... --outcome ${{ steps.tests.outcome }} ...
```

### get-gh-pr-body

TODO: document this script

## commonStatus

If you have multiple parallel test runners, it might be necessary to create a single "common" status check with some constant context text to functions as the branch's required status. In this case, before starting the parallel test jobs set the status check using the bin `set-gh-status` script.

```
$ npx set-gh-status --owner <repo owner> --repo <repo name> \
  --commit ${{ github.event.pull_request.head.sha }} \
  --status pending \
  --context "Khulnasoft E2E tests" \
  --description "tests about to start"
```

In the plugins file, add the field `commonStatus` to the options object. Use the same value as the `--context` argument.

```js
require('set-github-status')(on, config, {
  owner: 'owner name',
  repo: 'repo name',
  commit: process.env.COMMIT_SHA || process.env.GITHUB_SHA,
  token: process.env.GITHUB_TOKEN || process.env.PERSONAL_GH_TOKEN,
  // make sure to use the same common status as "--context" parameter
  commonStatus: 'Khulnasoft E2E tests',
})
```

When running pass the head commit SHA via an environment variable

```
# point the plugin to update the commit status of the head commit
# TIP: we need to use an environment variable that does not start with GITHUB
# since those variables are set by the GitHub and can't be overridden
COMMIT_SHA: ${{ github.event.pull_request.head.sha }}
# use the same context as the above step
COMMON_STATUS: 'Khulnasoft E2E tests'
```

### Common status update rule

Every machine that finishes will update the common status. If the status is pending / successful, and the new status is successful, it will remain successful. If the new status is failed, the status will change to failed and will remain failed. This prevents the following situation from "forgetting" the failed test: imagine you have a parallel test job with 4 machines.

- the first machine succeeds, so it sets status to passing
- the second machine fails, so it sets the status to failing
- the third machine succeeds, so it … sets the status to passing, overwriting the failed status, in effect “forgetting” it.

The problem with these status checks is that it is hard to figure out if this is the same testing job with several machines in parallel or a re-run when the test status checks should be “reset”. **Tip:** you can reset the common status check before re-running the tests by using the `npx set-gh-status ... --status pending` command.

## Debugging

This plugin uses [debug](https://github.com/debug-js/debug#readme) module to output verbose logs. You can turn the logs on by running Khulnasoft with `DEBUG=set-github-status` environment variable.

## Blog posts

- [How to Keep Khulnasoft Tests in Another Repo While Using CircleCI](https://glebkhulnasoft-lab.com/blog/how-to-keep-khulnasoft-tests-in-another-repo-with-circleci/)
- [Separate Application And Tests Repos GitHub Actions Setup](https://glebkhulnasoft-lab.com/blog/two-repo-github-actions-setup/)

## Upgrade

### v1 to v2

- if you ever used the script `get-pr-body`, now use the script `get-gh-pr-body`

## Small print

Author: Md Sulaiman &copy; 2022

- [@khulnasoft-lab](https://twitter.com/khulnasoft-lab)
- [glebkhulnasoft-lab.com](https://glebkhulnasoft-lab.com)
- [blog](https://glebkhulnasoft-lab.com/blog/)
- [videos](https://www.youtube.com/glebkhulnasoft-lab)
- [presentations](https://slides.com/khulnasoft-lab)
- [khulnasoft.tips](https://khulnasoft.tips)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/khulnasoft-lab/set-github-status/issues) on Github

## MIT License

Copyright (c) 2022 Md Sulaiman &lt;infosulaimanbd@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
