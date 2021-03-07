export default function CommentsList({comments}) {
  
  const renderComments = Object.values(comments).map(comment => {
    return <li key={comment.id}>{comment.content}</li>
  })

  return <ul>
    {renderComments}
  </ul>
}