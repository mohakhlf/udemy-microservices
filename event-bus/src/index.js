const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { randomBytes } = require('crypto');
const cors = require('cors');

const logger = require('./config/winston');

const PORT = 4002;
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

app.listen(PORT, () => {
  logger.info(`app posts listening on http://posts.localhost`);
  logger.debug("More detailed log");
})