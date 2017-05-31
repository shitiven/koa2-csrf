/* eslint-disable no-console */

require('babel-register')({
    plugins: [ 'transform-async-to-generator', 'transform-runtime', 'async-to-promises']
});

process.on('unhandledRejection', function (error) {
    console.error('Unhandled Promise Rejection:');
    console.error(error && error.stack || error);
});