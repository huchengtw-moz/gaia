'use strict';

/* global require, exports */
var utils = require('utils');

var SystemAppBuilder = function() {
};

// set options
SystemAppBuilder.prototype.setOptions = function(options) {
  this.stageDir = utils.getFile(options.STAGE_APP_DIR);
  this.appDir = utils.getFile(options.APP_DIR);
  this.distDirPath = options.GAIA_DISTRIBUTION_DIR;
};

SystemAppBuilder.prototype.addCustomizeFiles = function() {
  if (!utils.getFile(this.distDirPath, 'power').exists()) {
    return;
  }
  var self = this;
  var fileDir = utils.getFile(this.distDirPath, 'power');
  var files = utils.ls(fileDir);
  files.forEach(function(file) {
    utils.copyFileTo(file.path,
      utils.joinPath(self.stageDir.path, 'resources', 'power'),
        file.leafName, true);
  });
};

SystemAppBuilder.prototype.initConfigJsons = function() {
  var iccDefault = {
    'defaultURL': 'http://www.mozilla.org/en-US/firefoxos/'
  };
  var wapuaprofDefault = {
  };
  var euRoamingDefault = {
  };
  var iccFile = utils.getFile(this.stageDir.path, 'resources', 'icc.json');
  var wapFile = utils.getFile(this.stageDir.path, 'resources',
    'wapuaprof.json');
  var euRoamingFile = utils.getFile(this.stageDir.path, 'resources',
    'eu-roaming.json');

  utils.writeContent(iccFile,
    utils.getDistributionFileContent('icc', iccDefault, this.distDirPath));

  utils.writeContent(wapFile,
    utils.getDistributionFileContent('wapuaprof',
      wapuaprofDefault, this.distDirPath));

  utils.writeContent(euRoamingFile,
    utils.getDistributionFileContent('eu-roaming',
      euRoamingDefault, this.distDirPath));

};

/**
 * XXX: Before we can pull LockScreen out, we need this to split
 * LockScreen and System app while still merge them into one file.
 * (Bug 1057198).
 */
SystemAppBuilder.prototype.integrateLockScreen = function(stagePath,
                                                          systemIndexContent) {
  var lockscreenFrameElement = '<div id="lockscreen-frame-placeholder"></div>';
  // Paths must indicate to the files in build stage directory.
  var lsFile = utils.getFile(stagePath, 'lockscreen', 'lockscreen.html');
  var lockscreenContent = utils.getFileContent(lsFile);
  return systemIndexContent.replace(lockscreenFrameElement, lockscreenContent);
};

SystemAppBuilder.prototype.integrateCodes = function(options) {
  var stagePath = options.STAGE_APP_DIR;
  // get apps/system/index.html
  var systemIndexPath = [stagePath, 'index.html'];
  var systemIndexFile = utils.getFile.apply(utils, systemIndexPath);
  var systemIndexContent = utils.getFileContent(
      systemIndexFile);

  // original lockscreen staffs
  var replacedContent = this.integrateLockScreen(stagePath, systemIndexContent);

  utils.writeContent(systemIndexFile, replacedContent);
};

SystemAppBuilder.prototype.copyTVSpecific = function(options) {
  var filesToCopy = ['tv_homescreen_window_manager.js',
                     'landing_app_window.js',
                     'landing_app_launcher.js'];
  filesToCopy.forEach(function(f) {
    utils.copyFileTo(utils.joinPath(options.APP_DIR, 'js', f),
                     utils.joinPath(options.STAGE_APP_DIR, 'js'));
  });
  utils.copyFileTo(utils.joinPath(options.APP_DIR, 'index.html'),
                   utils.joinPath(options.STAGE_APP_DIR));
};

SystemAppBuilder.prototype.execute = function(options) {
  // use phone version system app.
  utils.copyToStage({
    APP_DIR: utils.joinPath(options.GAIA_DIR, 'apps', 'system'),
    STAGE_DIR: options.STAGE_DIR
  });

  this.setOptions(options);
  this.copyTVSpecific(options);
  this.initConfigJsons();
  if (this.distDirPath) {
    this.addCustomizeFiles();
  }
  this.integrateCodes(options);
};
//TODO: to check why build_stage has system but not in profile ???
exports.execute = function(options) {
  (new SystemAppBuilder()).execute(options);
};
