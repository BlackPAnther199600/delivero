const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    // Polyfills per i moduli Node richiesti erroneamente
    url: require.resolve('url/'),
    crypto: require.resolve('expo-crypto'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    // Reindirizzamento forzato di Axios alla versione corretta
    axios: path.resolve(__dirname, 'node_modules/axios/dist/axios.js'),
    // Altri moduli Node da ignorare
    http2: false,
    zlib: false,
    fs: false,
};

// Rimuovi la blacklistRE se l'avevi messa, usiamo l'alias sopra che è più potente
config.resolver.blacklistRE = null;

module.exports = config;