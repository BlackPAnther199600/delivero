const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    url: require.resolve('url/'),
    crypto: require.resolve('expo-crypto'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    // Moduli Node da ignorare completamente su Mobile
    http2: false,
    zlib: false,
    fs: false,
    net: false,
    tls: false,
    child_process: false,
};

module.exports = config;