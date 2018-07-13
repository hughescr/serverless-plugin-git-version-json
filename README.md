# Serverless plugin to track git version in deployments

This plugin for serverless will improve create a file called `git_version.json` during artifact creation.  The file contents will be as:

```
{
    gitVersion: "STUFF"
}
```

where `STUFF` is the output of `git describe --tags --dirty`.  That way you can `require()` the JSON file in your code to get the git version this deployment was from at runtime.

## To use this plugin

 - `yarn add @hughescr/serverless-plugin-git-version-json --dev` or
  `npm install --save-dev @hughescr/serverless-plugin-git-version-json`
 - Add `serverless-plugin-git-version-json` to the `plugins` section of your `serverless.yml`
 - Add `versionJSONFile: git_version.json` to the `custom` section of your `serverless.yml`

eg:

```
...
package:
  exclude:
    - somefile.json
    - tests/**
    - package.json
    - serverless.yml

custom:
  versionJSONFile: git_version.json

plugins:
  - serverless-plugin-git-version-json
...
```
