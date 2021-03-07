const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const logger = require('./config/winston');

const PORT = 4005;
const app = express();
app.use(bodyParser.json());
app.use(cors());
const posts = {};

const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : "combined";


app.use(
  morgan(morganFormat, {
    skip: function(req, res) {
      return res.statusCode < 400;
    },
    stream: process.stderr
  })
);

app.use(
  morgan(morganFormat, {
    skip: function(req, res) {
      return res.statusCode >= 400;
    },
    stream: process.stdout
  })
);

app.use((err, req, res, next) => {
  // Fallback to default node handler
  if (res.headersSent) {
    next(err);
    return;
  }

  logger.error(err.message, {url: req.originalUrl});

  res.status(500);
  res.json({ error: err.message });
});

app.get("/error", function(req, res) {
  throw new Error('Problem Here!');
});

app.post('/events', (req, res) => {
  const event = req.body;

  axios.post('http://posts:4000/events', event).catch((err) => console.log("Error : ", err.message));
  axios.post('http://comments:4001/events', event).catch((err) => console.log("Error : ", err.message));
  axios.post('http://query:4002/events', event).catch((err) => console.log("Error : ", err.message));

  res.send({ status: 'OK' });
});

app.listen(PORT, () => {
  logger.info(`app Event-bus listening on http://localhost:${PORT}/event`);
  logger.debug("More detailed log");
})