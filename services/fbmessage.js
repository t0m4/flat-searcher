'use strict';
const Promise = require('bluebird');
const getApi = require('facebook-chat-api');
const _ =require('lodash');
let fbApi;

function login() {
  return new Promise((resolve, reject) => {
    if ((!process.env.FB_EMAIL || !process.env.FB_PASSWORD) && !process.env.APP_STATE) return resolve();
    let credentials = {};
    if (process.env.APP_STATE) credentials = { appState: JSON.parse(process.env.APP_STATE) };
    else credentials = { email: process.env.FB_EMAIL, password: process.env.FB_PASSWORD };
    console.info('Connecting to FB API');
    return getApi(credentials, (err, api) => {
      if (err) return reject(err);
      if (process.env.FB_SENDER_ID) api.setOptions({ pageID: process.env.FB_SENDER_ID });
      console.info('Connected to FB API');
      fbApi = Promise.promisifyAll(api);
      return resolve();
    });
  });
}

function send(msg, to) {
  return new Promise((resolve, reject) => {
    if (!fbApi) return resolve();
    console.log('Sending message...');
    return fbApi.sendMessage(msg, to, (err, msgInfo) => {
      if (err) {
        console.error(err);
        return resolve();
      }
      return resolve();
    });
  });
}


module.exports = {
  login,
  send
};
