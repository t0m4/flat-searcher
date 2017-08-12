'use strict';
const Promise = require('bluebird');
const getApi = require('facebook-chat-api');

let fbApi;

function login() {
  return new Promise((resolve, reject) => {
    if (!process.env.FB_EMAIL || !process.env.FB_PASSWORD) return resolve();
    return getApi({ email: process.env.FB_EMAIL, password: process.env.FB_PASSWORD }, (err, api) => {
      if (err) return reject(err);
      if (process.env.FB_SENDER_ID) api.setOptions({ pageID: process.env.FB_SENDER_ID });
      fbApi = api;
      return resolve();
    });
  });
}

function send(msg, to) {
  return new Promise((resolve, reject) => {
    if (!fbApi) return resolve();
    return fbApi.sendMessage(msg, to, (err, msgInfo) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

module.exports = {
  login,
  send
};