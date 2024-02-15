const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const createError = require('./utils/error');
const initRoutes = require('./routes');

const app = express();

// common middlewares

app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// setup routes

initRoutes(app);

// global error handlers

app.use('*', (req, res, next) => {
      next(createError(404, 'Not Found'));
});

app.use((err, req, res, next) => {
      if (err.status != 404) console.error(err.message);

      const status = err.status || 500;
      const message = err.message || 'Internal Server Error';

      res.status(status).send({ status, message });
});

module.exports = app;
