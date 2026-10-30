
import React from 'react';

function Card(props) {

  // Download image
  const handleDownload = async () => {
    try {
      const response = await fetch(props.Img);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'status-image.jpg';

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);

      props.onDownload?.();

    } catch (error) {
      alert('Image download nahi ho paya. Image new tab mein open ho sakti hai.');
      window.open(props.Img, '_blank');
    }
  };

  // Share image
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Status Image',
          text: 'Check out this status image!',
          url: props.Img,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(props.Img);
        alert('Image link copied!');
      } else {
        alert('Sharing is not supported in this browser.');
        return;
      }

      props.onShare?.();

    } catch (error) {
      if (error.name !== 'AbortError') {
        alert('Share nahi ho paya.');
      }
    }
  };

  // Like / Unlike image
  const handleLike = () => {
    if (props.canLike && !props.likeBusy) {
      props.onLike?.();
    }
  };

  return (
    <div className="image-card">

      <img src={props.Img} alt={props.authorName || 'Status'} />

      {props.authorName && (
        <p className="image-author">
          By {props.authorName}
        </p>
      )}

      <div className="card-actions">

        <div className="left-actions">

          <button
            className="like-btn"
            onClick={handleLike}
            disabled={!props.canLike || props.likeBusy}
          >
            {props.likeBusy
              ? 'Please wait...'
              : props.liked
                ? '❤️ Liked'
                : '🤍 Like'}
          </button>

          <span className="like-count">
            {props.likeCount || 0}
          </span>

          <button
  type="button"
  className="share-btn"
  onClick={handleShare}
>
            🔗 Share
          </button>

          <span className="share-count">
            {props.shareCount || 0}
          </span>

        </div>

        <div className="right-actions">

          <button
           type="button"
            className="download-btn"
            onClick={handleDownload}
          >
            Download
          </button>

          <span className="download-count">
            ↓ {props.count || 0}
          </span>

          {props.canDelete && (
            <button
             type="button"
              className="delete-btn"
              onClick={props.onDelete}
              title="Delete image"
              aria-label="Delete image"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          )}

        </div>

      </div>

      {props.count >= 50 && (
        <div className="milestone-message">
          🎉 50 Downloads Milestone Reached!
        </div>
      )}

    </div>
  );
}

export default Card;