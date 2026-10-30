
import React from 'react';

function Card(props) {

  const handleDownload = async () => {
    try {
      const response = await fetch(props.Img);
      const blob = await response.blob();

      const imageUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = imageUrl;
      link.download = 'status-image.jpg';

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(imageUrl);

      props.onDownload();

    } catch (error) {
      window.open(props.Img, '_blank');
      props.onDownload();
    }
  };

  return (
    <div className="image-card">

      <img src={props.Img} alt="Status" />

      <div className="card-actions">

  {/* Left Side */}
  <button
    className="download-btn"
    onClick={handleDownload}
  >
    Download
  </button>

  {/* Right Side */}
  <div className="right-actions">

    <span className="download-count">
      ↓ {props.count}
    </span>

    <button
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
