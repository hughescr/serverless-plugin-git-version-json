# Serverless plugin to track git version in deployments

This plugin for serverless will improve create a file called `git_version.json` during artifact creation.  The file contents will be as:

```
{
    gitVersion: "STUFF",
    deployTime: "DEPLOY_TIME"
}
```

where `STUFF` is the output of `git describe --tags --dirty`.  That way you can `require()` the JSON file in your code to get the git version this deployment was from at runtime.

`DEPLOY_TIME` is the output of Moment JS now() with a time zone that can be specified. 
## To use this plugin

 - `yarn add @hughescr/serverless-plugin-git-version-json --dev` or
  `npm install --save-dev @hughescr/serverless-plugin-git-version-json`
 - Add `serverless-plugin-git-version-json` to the `plugins` section of your `serverless.yml`
 - Add `versionJSONFile: git_version.json` to the `custom` section of your `serverless.yml`. Defaults to git_version.json if not specified.
 - Add `deployTimeZone: {IANA_TIMEZONE_NAME}` to the `custom` section of your `serverless.yml`. A valid IANA time zone must be given. Otherwise, default to UTC. https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

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
  deployTimeZone: America/Los_Angeles

plugins:
  - serverless-plugin-git-version-json
...
```
