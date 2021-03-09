const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const logger = require('./config/winston');

const PORT = 4001;
const app = express();
app.use(bodyParser.json());
app.use(cors());
const commentsByPostId = {};

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



app.get('/posts/:id/comments', (req, res) => {
 res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending'
    }
  });

  res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
  console.log('Event Received:', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find(comment => {
      return comment.id === id;
    });
    comment.status = status;

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        status,
        postId,
        content
      }
    });
  }

  console.log('comments', commentsByPostId)

  res.send({});
});

app.get("/error", function(req, res) {
 throw new Error('Problem Here!');
});

app.listen(PORT, () => {
 logger.info("app comments listening on http://localhost:4001");
 logger.debug("More detailed log");
})