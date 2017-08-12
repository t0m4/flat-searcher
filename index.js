'use strict';
const Promise = require('bluebird');

const basicAuth = require('basic-auth');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const enableDestroy = require('./modules/enable-destroy');
const MongoQs = require('mongo-querystring');
const qsParser = new MongoQs();

const { login } = require('./services/fbmessage');
const searcher = require('./modules/searcher');

const { connect, getUser, getAllForSource, getFlats, clearFlats, getLatestFlats } = require('./services/mongo');

const DEFAULT_PARAMS = {
  rooms: {
    max: 1
  },
  halfRooms: {
    max: 1
  },
  location: {
    districts: ['v.', 'vi.', 'vii.', 'viii.']
  },
  price: {
    max: 100000,
    min: 30000
  },
  balcony: true
};

let PARAMS = {};

try {
  const PARAMS = JSON.parse(process.env.PARAMS);
} catch(err) {
  PARAMS = DEFAULT_PARAMS;
}

function startApp() {
  return new Promise((resolve, reject) => {
    const app = express();
    const port = process.env.PORT || 3001;
    app.set('port', port);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('*', (req, res, next) => {
      const user = basicAuth(req);
      return getUser(user.name, user.pass)
        .then(usr => {
          if (!usr) return res.status(401).end();
          return next();
        })
        .catch((err) => {
          console.error(err);
          return res.status(401).end();
        })
    });

    app.get('/', (req, res) => {
      return res.send({ ok: true });
    });

    app.get('/flats', (req, res, next) => {
      const qs = qsParser.parse(req.query);
      return getFlats(qs)
        .then(result => res.send(result))
        .catch(err => next(err));
    });

    app.get('/flats/latest', (req, res, next) => {
      if (!req.query.date) return next('date is required');
      const date = new Date(req.query.date);
      return getLatestFlats(date)
        .then(result => res.send(result))
        .catch(err => next(err));
    });

    app.get('/flats/:source', (req, res, next) => {
      const source = req.params.source;
      const qs = qsParser.parse(req.query);
      return getAllForSource(source)
        .then(result => res.send(result))
        .catch(err => next(err));
    });

    app.get('/flats/clear', (req, res, next) => {
      return clearFlats()
        .then(() => res.status(200).end())
        .catch(err => next(err));
    });

    const server = http.createServer(app).listen(port, (err) => {
      if (err) return reject(err);
      enableDestroy(server, console);
      console.info(`Server started on port: ${port}`);
      return resolve();
    });
  });
}

function* startUp() {
  yield Promise.all([
    login(),
    startApp()
  ]);

  return searcher(PARAMS);
}

connect().
  then(Promise.coroutine(startUp))
  .then(() => {
    console.log('started');
  })
  .catch(err => console.error(err));
