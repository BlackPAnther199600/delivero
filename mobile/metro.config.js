const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 1. Forza Metro a guardare i polyfill
config.resolver.extraNodeModules = {
    url: require.resolve('url/'),
    crypto: require.resolve('expo-crypto'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    // Qui uccidiamo gli errori Node una volta per tutte
    http2: false,
    zlib: false,
    fs: false,
    net: false,
    tls: false,
    child_process: false,
    // FORZATURA AXIOS: puntiamo direttamente al bundle browser
    axios: path.resolve(__dirname, 'node_modules/axios/dist/axios.js'),
};

// 2. Assicuriamoci che Metro non provi mai a caricare i file .cjs di axios
config.resolver.sourceExts = [...config.resolver.sourceExts, 'js', 'json', 'ts', 'tsx'];
config.resolver.assetExts = [...config.resolver.assetExts, 'png', 'jpg'];

module.exports = config;