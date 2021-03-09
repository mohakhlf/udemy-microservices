const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { randomBytes } = require('crypto');
const axios = require('axios');

const logger = require('./config/winston');

const PORT = 4003;
const app = express();
app.use(bodyParser.json());

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

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved';

    await axios.post('http://event-bus:4005/events', {
      type: 'CommentModerated',
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content
      }
    }).catch((err) => {
      console.log(err.message);
    });
  }

  res.send({});
});

app.get("/error", function(req, res) {
  throw new Error('Problem Here!');
});

app.listen(PORT, () => {
  logger.info(`app moderation listening on http://localhost:${PORT}`);
  logger.debug("More detailed log");
})