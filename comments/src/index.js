const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { randomBytes } = require('crypto');
const cors = require('cors');

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

app.post('/posts/:id/comments', (req, res) => {
 const commentsId = randomBytes(4).toString('hex');
 const {content} = req.body;

 const comments = commentsByPostId[req.params.id] || [];

 comments.push({id: commentsId, content});

 commentsByPostId[req.params.id] = comments;

 res.status(201).send(comments);
});

app.get("/error", function(req, res) {
 throw new Error('Problem Here!');
});

app.listen(PORT, () => {
 logger.info("app comments listening on http://comments.localhost:");
 logger.debug("More detailed log");
})