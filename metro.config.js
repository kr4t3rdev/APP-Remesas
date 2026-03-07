const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;
const deviceEmitterPath = path.resolve(
  __dirname,
  'node_modules/react-native-web/dist/exports/DeviceEventEmitter/index.js',
);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-web/dist/exports/DeviceEventEmitter': deviceEmitterPath,
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-web/dist/exports/DeviceEventEmitter') {
    return {
      filePath: deviceEmitterPath,
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
