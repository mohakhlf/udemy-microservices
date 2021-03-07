const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const logger = require('./config/winston');

const PORT = 4000;
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


app.get('/posts', (req, res) => {
  res.send(posts)
});

app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body

  posts[id] = {
    id, title
  };

  await axios.post('http://event-bus:4005/events', {
    type: 'PostCreated',
    data: {
      id, title
    }
  }).catch((err) => console.log("Error : ", err.message));

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Event cecived', req.body.type);

  res.send({})
});

app.get("/error", function(req, res) {
  throw new Error('Problem Here!');
});

app.listen(PORT, () => {
  logger.info(`app posts listening on http://localhost:${PORT}`);
  logger.debug("More detailed log");
})