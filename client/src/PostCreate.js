import React, { useState } from 'react';
import axios from 'axios';


export default function PostCreate() {
  const [title, setTtitle] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();

    await axios.post('http://localhost:4000/posts',{
      title
    });

    setTtitle('');
  }

  return <div>
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Title</label>
        <br/>
        <input value={title} onChange= {e => setTtitle(e.target.value)} className="form-controle"/>
      </div>
      <button className="btn btn-primary">Submit</button>
    </form>
  </div>;
}

