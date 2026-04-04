import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Loader } from './Loader';
import { Post } from '../types/Post';
import { Comment, CommentData } from '../types/Comment';
import { NewCommentForm } from './NewCommentForm';
import { createNewComment, deleteComment } from '../services/services';

type Props = {
  selectedPost?: Post | null;
  comments: Comment[];
  loadingPostDetails: boolean;
  errorDownloadPostDetails: boolean;
  isOpenCommentForm: boolean;
  setComments: Dispatch<SetStateAction<Comment[]>>;
  setIsOpenCommentForm: Dispatch<SetStateAction<boolean>>;
};

export const PostDetails = React.memo<Props>(
  ({
    comments,
    loadingPostDetails,
    errorDownloadPostDetails,
    isOpenCommentForm,
    selectedPost,
    setComments,
    setIsOpenCommentForm,
  }) => {
    const [selectedDeleteComment, setSelectedDeleteComment] = useState<
      number | null
    >(null);
    const [errorDeleteComment, setErrorDeleteComment] = useState(false);
    const [newCommentData, setNewCommentData] = useState<CommentData | null>(
      null,
    );
    const [errorNewComment, setErrorNewComment] = useState(false);
    const [commentButtonLoading, setCommentButtonLoading] = useState(false);

    const handleDeleteComment = useCallback((commentId: number) => {
      setSelectedDeleteComment(commentId);
    }, []);

    const handleOpenNewCommentForm = useCallback(() => {
      setIsOpenCommentForm(true);
    }, []);

    function deleteCommentById(commentId: number | null) {
      if (!commentId) {
        return;
      }

      setSelectedDeleteComment(null);
      const commentIdString = String(commentId);

      deleteComment(commentIdString)
        .then(() => {
          setComments(currentComments =>
            currentComments.filter(comment => comment.id !== commentId),
          );
        })
        .catch(() => {
          setErrorDeleteComment(true);
        });
    }

    useEffect(() => {
      if (selectedDeleteComment) {
        deleteCommentById(selectedDeleteComment);
      }
    }, [selectedDeleteComment]);

    function addComment(newData: CommentData) {
      setCommentButtonLoading(true);
      createNewComment(newData)
        .then(createdComment => {
          setComments(currentComments => [...currentComments, createdComment]);
        })
        .catch(() => {
          setErrorNewComment(true);
        })
        .finally(() => {
          setCommentButtonLoading(false);
        });
    }

    useEffect(() => {
      if (newCommentData) {
        addComment(newCommentData);
        setNewCommentData(null);
      }
    }, [newCommentData]);

    return (
      <div className="content" data-cy="PostDetails">
        <div className="content" data-cy="PostDetails">
          <div className="block">
            <h2 data-cy="PostTitle">
              {`#${selectedPost?.id}: ${selectedPost?.title}`}
            </h2>

            <p data-cy="PostBody">{selectedPost?.body}</p>
          </div>

          <div className="block">
            {loadingPostDetails && <Loader />}

            {errorDownloadPostDetails && !loadingPostDetails && (
              <div className="notification is-danger" data-cy="CommentsError">
                Something went wrong, cant download comments
              </div>
            )}

            {comments.length === 0 &&
              !loadingPostDetails &&
              !errorDownloadPostDetails && (
                <p className="title is-4" data-cy="NoCommentsMessage">
                  No comments yet
                </p>
              )}

            {comments.length > 0 &&
              !loadingPostDetails &&
              !errorDownloadPostDetails && (
                <p className="title is-4">Comments:</p>
              )}

            {comments.map(comment => (
              <article
                key={comment.id}
                className="message is-small"
                data-cy="Comment"
              >
                <div className="message-header">
                  <a href={`mailto:${comment.email}`} data-cy="CommentAuthor">
                    {comment.name}
                  </a>
                  <button
                    data-cy="CommentDelete"
                    type="button"
                    className="delete is-small"
                    aria-label="delete"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    delete button
                  </button>
                </div>

                <div className="message-body" data-cy="CommentBody">
                  {comment.body}
                </div>
              </article>
            ))}

            {errorDeleteComment && !loadingPostDetails && (
              <div
                className="notification is-danger"
                data-cy="DeleteCommentError"
              >
                Something went wrong, cant delete comment
              </div>
            )}

            {!isOpenCommentForm &&
              !loadingPostDetails &&
              !errorDownloadPostDetails && (
                <button
                  data-cy="WriteCommentButton"
                  type="button"
                  className="button is-link"
                  onClick={handleOpenNewCommentForm}
                >
                  Write a comment
                </button>
              )}
          </div>

          {isOpenCommentForm && !errorNewComment && (
            <NewCommentForm
              commentButtonLoading={commentButtonLoading}
              onSubmit={setNewCommentData}
              selectedPost={selectedPost}
            />
          )}

          {errorNewComment && !commentButtonLoading && (
            <div className="notification is-danger" data-cy="CommentsError">
              Something went wrong, cant add comment
            </div>
          )}
        </div>
      </div>
    );
  },
);

PostDetails.displayName = 'PostDetails';
