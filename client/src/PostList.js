import axios from 'axios';
import React, { useState, useEffect } from 'react';
import CommentsCreate from './CommentsCreate';
import CommentsList from './CommentsList';

export default function PostList() {
  const [posts, setPosts] = useState({});

  const fetchPosts = async () => {
    const res = await axios.get('http://posts.com/posts');

    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderedPosts = Object.values(posts).map(post => {
    return (
      <div
        className="card"
        style={{ width: '30%', marginBottom: '20px' }}
        key={post.id}
      >
        <div className="card-body">
          <h3>{post.title}</h3>
          <CommentsList comments={post.comments} />
          <CommentsCreate postId={post.id} />
        </div>
      </div>
    );
  });

  return (
    <div className="d-flex flex-row flex-wrap justify-content-between">
      {renderedPosts}
    </div>
  );
}