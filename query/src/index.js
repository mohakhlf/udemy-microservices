const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

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

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    comment.status = status;
    comment.content = content;
  }
};

app.get('/posts', (req, res) => {
  console.log('posts', posts);
  res.send(posts);
})
app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  console.log(posts);

  res.send({});
});

app.get("/error", function(req, res) {
 throw new Error('Problem Here!');
});

app.listen(PORT, async () => {
 logger.info(`app query listening on http://localhost:${PORT}`);
 logger.debug("More detailed log");

 const res = await axios.get('http://event-bus-srv:4005/events');

 for (let event of res.data) {
  console.log('Processing event:', event.type);

  handleEvent(event.type, event.data);
}
})