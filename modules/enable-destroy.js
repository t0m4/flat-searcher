'use strict';
const Promise = require('bluebird');

function enableDestroy(_server, logger) {
  const connections = {};

  _server.on('connection', (conn) => {
    const key = conn.remoteAddress + ':' + conn.remotePort;
    connections[key] = conn;
    conn.on('close', () => {
      delete connections[key];
    });
  });

  _server.destroy = () => {
    return new Promise((resolve, reject) => {
      _server.close((err) => {
        if (err) return reject(err);
        logger.info('Server stopped');
        return resolve();
      });
      for (let key in connections) {
        connections[key].destroy();
      }
    });
  };
}

module.exports = enableDestroy;
