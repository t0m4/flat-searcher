'use strict';
const Promise = require('bluebird');
const _ = require('lodash');

const basicAuth = require('basic-auth');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const enableDestroy = require('./modules/enable-destroy');
const MongoQs = require('mongo-querystring');
const qsParser = new MongoQs();

const { connect, getUser, getAllForSource, getFlats, clearFlats, getLatestFlats } = require('./services/mongo');

function startApp() {
  return new Promise((resolve, reject) => {
    const app = express();
    const port = process.env.PORT || 3001;
    app.set('port', port);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/heartbeat', (req, res) =>
      res.send({
        data: _.assign({ now: new Date().toISOString(), uptime: process.uptime() }, process.memoryUsage())
      })
    );

    app.use('*', (req, res, next) => {
      const user = basicAuth(req);
      if (!user) return res.status(401).end();
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

connect()
  .then(startApp)
  .then(() => {
    console.log('started');
  })
  .catch(err => console.error(err));
