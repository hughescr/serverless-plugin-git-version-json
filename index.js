'use strict';

const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
const moment = require('moment-timezone');

class GitVersionOnDeploy {
  get options() {
    const options = Object.assign(
      {
        deployTimeZone: 'utc'
      }, this.serverless.service.custom ||
      {}
    );

    const time_zone = moment.tz.zone(options.deployTimeZone);
    if(time_zone === null) {
      this.serverless.cli.log(
        'WARNING: Bad time zone, falling back to UTC. You must use IANA timezone names.'
      );
      options.deployTimeZone = 'utc';
    } else {
      this.serverless.cli.log(`Using time zone: ${options.deployTimeZone}`);
    }

    return options;
  }

  constructor(serverless) {
    this.serverless = serverless;
    this.path = serverless.config.servicePath;
    const custom = serverless.service.custom || {};
    this.versionJSON = custom.versionJSONFile;
    if(!this.versionJSON) {
      this.serverless.cli.log('Path for git_version.json not specified.  Using "git_version.json".');
      this.versionJSON = 'git_version.json';
    }
    this.filePath = path.join(this.path, this.versionJSON);

    this.hooks = {
      'offline:start:init': this.writeVersionFile.bind(this),
      'before:deploy:function:deploy': this.writeVersionFile.bind(this),
      'after:deploy:function:deploy': this.deleteVersionFile.bind(this),
      'before:deploy:createDeploymentArtifacts': this.writeVersionFile.bind(this),
      'after:deploy:createDeploymentArtifacts': this.deleteVersionFile.bind(this),
    };
  }

  writeVersionFile() {
    let versionFileContents = '{ "gitVersion": "';
    const gitResults = spawnSync('git', ['describe', '--tags', '--dirty'], { cwd: this.path, encoding: 'utf8' });
    if(gitResults.status != 0) {
      this.serverless.cli.log('Error while running "git describe --tags --dirty":');
      this.serverless.cli.log(gitResults.stderr);
      return;
    }
    const git_id = gitResults.stdout.trim();

    const deploy_time = moment().tz(this.options.deployTimeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

    versionFileContents = `{ "gitVersion": "${git_id}", "deployTime": "${deploy_time}"}`;

    fs.writeFileSync(this.filePath, versionFileContents);
    this.serverless.cli.log(`Tagged with git version ${git_id}`);
    this.serverless.cli.log(`Deploy time ${deploy_time}`);
  }

  deleteVersionFile() {
    fs.unlinkSync(this.filePath);
    this.serverless.cli.log(`Deleted ${this.versionJSON}`);
  }
}

module.exports = GitVersionOnDeploy;
