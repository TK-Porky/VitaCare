// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs   = require('fs');

const projectRoot   = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// In a pnpm monorepo the root node_modules may not exist.
// Only watch the workspace root when it actually has a node_modules dir.
const rootNodeModules = path.resolve(workspaceRoot, 'node_modules');
if (fs.existsSync(rootNodeModules)) {
  config.watchFolders = [workspaceRoot];
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    rootNodeModules,
  ];
} else {
  // Standalone — only local node_modules
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
  ];
}

module.exports = config;

