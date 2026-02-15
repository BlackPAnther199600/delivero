const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Risolvi i moduli Node non supportati in React Native
config.resolver.extraNodeModules = {
    http2: false,
    zlib: false,
    fs: false,
    net: false,
    tls: false,
    child_process: false,
    crypto: false,
};

module.exports = config;