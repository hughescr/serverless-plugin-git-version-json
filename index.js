'use strict';

const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
const moment = require('moment-timezone');

class GitVersionOnDeploy {
  get options() {
    const options = Object.assign(
      {
        deployTimeZone: 'utc',
        versionJSONFile: 'git_version.json'
      }, this.serverless.service.custom ||
      {}
    );

    const time_zone = moment.tz.zone(options.deployTimeZone);
    if(time_zone === null) {
      this.serverless.cli.log(
        'WARNING: Bad time zone, falling back to UTC. You must use IANA timezone names.'
      );
      options.deployTimeZone = 'utc';
    }

    return options;
  }

  constructor(serverless) {
    this.serverless = serverless;
    this.path = serverless.config.servicePath;
    this.filePath = path.join(this.path, this.options.versionJSONFile);

    this.hooks = {
      'offline:start:init': this.writeVersionFile.bind(this),
      'before:deploy:function:deploy': this.writeVersionFile.bind(this),
      'after:deploy:function:deploy': this.deleteVersionFile.bind(this),
      'before:deploy:createDeploymentArtifacts': this.writeVersionFile.bind(this),
      'after:deploy:createDeploymentArtifacts': this.deleteVersionFile.bind(this),
    };
  }

  writeVersionFile() {
    let versionFileContents = '{ "gitVersion": "}';
    const gitResults = spawnSync('git', ['describe', '--tags', '--dirty'], { cwd: this.path, encoding: 'utf8' });
    if(gitResults.status != 0) {
      this.serverless.cli.log('Error while running "git describe --tags --dirty":');
      this.serverless.cli.log(gitResults.stderr);
      return;
    }
    const git_id = gitResults.stdout.trim();

    this.serverless.cli.log(`Writing out to: ${this.options.versionJSONFile}`);
    this.serverless.cli.log(`Using time zone: ${this.options.deployTimeZone}`);

    const deploy_time = moment().tz(this.options.deployTimeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

    versionFileContents = `{ "gitVersion": "${git_id}", "deployTime": "${deploy_time}"}`;

    fs.writeFileSync(this.filePath, versionFileContents);
    this.serverless.cli.log(`Tagged with git version ${git_id}`);
    this.serverless.cli.log(`Deploy time ${deploy_time}`);
  }

  deleteVersionFile() {
    fs.unlinkSync(this.filePath);
    this.serverless.cli.log(`Deleted ${this.options.versionJSONFile}`);
  }
}

module.exports = GitVersionOnDeploy;
