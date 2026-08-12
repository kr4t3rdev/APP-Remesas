const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;
const deviceEmitterPath = path.resolve(
  __dirname,
  'node_modules/react-native-web/dist/exports/DeviceEventEmitter/index.js',
);

// zustand ships an ESM build that uses `import.meta.env` (devtools middleware).
// Metro resolves it for web, but the browser then throws
// "Cannot use 'import.meta' outside a module". Force the CJS build instead.
const zustandCjsPaths = {
  zustand: path.resolve(__dirname, 'node_modules/zustand/index.js'),
  'zustand/middleware': path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
  'zustand/react': path.resolve(__dirname, 'node_modules/zustand/react.js'),
};

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

  const zustandCjsPath = zustandCjsPaths[moduleName];
  if (zustandCjsPath) {
    return {
      filePath: zustandCjsPath,
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
