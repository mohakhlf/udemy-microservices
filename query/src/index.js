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

app.get('/posts', (req, res) => {
  res.send(posts);
})

app.post('/events', (req, res) => {
  const { type, data } = req.body;
  console.log('Event cecived', req.body.type, req.body.data);

  if(type === 'PostCreated'){
    const {id, title} = data;

    posts[id] = { id, title, comments : [] };
  }

  if(type === 'commentCreated'){
    const {id, content, postId} = data;

    const post = posts[postId]

    post.comments.push({id, content});
  }

  console.log('posts', posts)

  res.send({});
})

app.get("/error", function(req, res) {
 throw new Error('Problem Here!');
});

app.listen(PORT, () => {
 logger.info(`app query listening on http://localhost:${PORT}`);
 logger.debug("More detailed log");
})