const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    url: require.resolve('url/'),
    crypto: require.resolve('expo-crypto'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    // Moduli Node che mandano in crash la build
    http2: false,
    zlib: false,
    fs: false,
    net: false,
    tls: false,
    child_process: false,
};

// Forza Metro a ignorare la versione "node" di axios se presente
config.resolver.blacklistRE = /node_modules\/axios\/dist\/node\/.*/;

module.exports = config;