'use strict';
const Promise = require('bluebird');
const getApi = require('facebook-chat-api');

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

function* send(msg, to) {
  if (!fbApi) yield login();
  console.info('Sending message...');
  return fbApi.sendMessageAsync(msg, to);
}

module.exports = {
  login,
  send: Promise.coroutine(send)
};
