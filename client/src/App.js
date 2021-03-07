import PostCreate from './PostCreate';
import PostList from './PostList';

function App() {
  return (
    <div className="App container">
      <h1>Blog app</h1>
      <PostCreate />
      <hr/>
      <PostList />
    </div>
  );
}

export default App;
