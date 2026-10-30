
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

function Card(props) {
  const [upiId, setUpiId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showEarningPopup, setShowEarningPopup] = useState(false);

  const likesTarget = Number(props.likesTarget) || 100;
  const downloadsTarget = Number(props.downloadsTarget) || 50;
  const sharesTarget = Number(props.sharesTarget) || 30;
  const rewardAmount = Number(props.rewardAmount) || 100;

  const likes = Number(props.likeCount) || 0;
  const downloads = Number(props.count) || 0;
  const shares = Number(props.shareCount) || 0;

  const likesComplete = likes >= likesTarget;
  const downloadsComplete = downloads >= downloadsTarget;
  const sharesComplete = shares >= sharesTarget;

  const allTargetsComplete =
    likesComplete && downloadsComplete && sharesComplete;

  const progress = (count, target) =>
    Math.min((count / target) * 100, 100);

  const handleDownload = async () => {
    try {
      const response = await fetch(props.Img);

      if (!response.ok) throw new Error('Download failed');

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

  const handleLike = () => {
    if (props.canLike && !props.likeBusy) {
      props.onLike?.();
    }
  };

  const handleRequestEarning = async (event) => {
    event.preventDefault();

    if (
      requesting ||
      !allTargetsComplete ||
      props.earningRequested ||
      !props.canDelete
    ) {
      return;
    }

    const phoneDigits = phoneNumber.replace(/\D/g, '');

    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!upiId.trim().includes('@')) {
      alert('Please enter a valid UPI ID.');
      return;
    }

    setRequesting(true);

    try {
      await props.onRequestEarning?.(upiId.trim(), phoneDigits);
      setShowPaymentPopup(false);
    } finally {
      setRequesting(false);
    }
  };

  const renderProgress = (label, count, target, complete, emoji) => (
    <div className="earning-progress-item">
      <div className="earning-progress-heading">
        <span>{emoji} {label}</span>
        <span>
          {count} / {target}
          {complete ? ' ✓' : ''}
        </span>
      </div>

      <div className="earning-progress-track">
        <div
          className={`earning-progress-fill ${complete ? 'completed' : ''}`}
          style={{ width: `${progress(count, target)}%` }}
        />
      </div>
    </div>
  );

  // Popup overlay: fixed to the entire browser screen
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(10, 18, 35, 0.72)',
    backdropFilter: 'blur(7px)',
    WebkitBackdropFilter: 'blur(7px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px',
    boxSizing: 'border-box',
    zIndex: 999999,
  };

  const popupStyle = {
    width: '100%',
    maxWidth: '420px',
    maxHeight: '85vh',
    overflowY: 'auto',
    background: '#ffffff',
    borderRadius: '22px',
    padding: '26px 22px',
    boxSizing: 'border-box',
    boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
    position: 'relative',
    color: '#172033',
    fontFamily: 'Arial, sans-serif',
    flexShrink: 0,
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '17px',
    border: 'none',
    background: '#f1f5f9',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#475569',
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 15px',
    border: '1px solid #dce3ed',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '15px',
    marginTop: '8px',
    marginBottom: '16px',
    background: '#f8fafc',
    color: '#172033',
  };

  return (
    <div className="image-card">

      <img src={props.Img} alt={props.authorName || 'Status'} />

      {props.authorName && (
        <p className="image-author">By {props.authorName}</p>
      )}

      <div className="card-actions">

        <div className="left-actions">
          <button
  type="button"
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

          <span className="like-count">{likes}</span>

          <button
            type="button"
            className="share-btn"
            onClick={handleShare}
          >
            🔗 Share
          </button>

          <span className="share-count">{shares}</span>
        </div>

        <div className="right-actions">
          <button
            type="button"
            className="download-btn"
            onClick={handleDownload}
          >
            Download
          </button>

          <span className="download-count">↓ {downloads}</span>

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

      {props.canDelete && (
        <button
          type="button"
          onClick={() => setShowEarningPopup(true)}
          style={{
            width: '100%',
            marginTop: '15px',
            padding: '13px 16px',
            border: '1px solid #d7e5ff',
            borderRadius: '13px',
            background: 'linear-gradient(135deg, #f0f5ff, #e8efff)',
            color: '#3158a5',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: '0.2s ease',
          }}
        >
          💰 Earning Details
        </button>
      )}

      {/* Earning Details Popup - rendered outside the image card */}
      {showEarningPopup && props.canDelete &&
        createPortal(
          <div
            style={overlayStyle}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowEarningPopup(false);
              }
            }}
          >
            <div
              style={popupStyle}
              role="dialog"
              aria-modal="true"
              aria-labelledby="earning-details-title"
            >
              <button
                type="button"
                onClick={() => setShowEarningPopup(false)}
                aria-label="Close earning details"
                style={closeButtonStyle}
              >
                ×
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '18px',
                    background: '#e8f8ef',
                    color: '#159957',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '27px',
                    margin: '0 auto 12px',
                  }}
                >
                  🎯
                </div>

                <h2
                  id="earning-details-title"
                  style={{
                    fontSize: '21px',
                    margin: '0 0 7px',
                    color: '#172033',
                  }}
                >
                  This Image's Earning Progress
                </h2>

                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                  Track your image performance and rewards.
                </p>
              </div>

              <div
                className="earning-progress"
                style={{
                  margin: 0,
                  padding: '18px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: 'none',
                }}
              >
                {renderProgress('Likes', likes, likesTarget, likesComplete, '❤️')}

                {renderProgress(
                  'Downloads',
                  downloads,
                  downloadsTarget,
                  downloadsComplete,
                  '📥'
                )}

                {renderProgress(
                  'Shares',
                  shares,
                  sharesTarget,
                  sharesComplete,
                  '🔗'
                )}

                <div className="earning-reward">
                  <span>Potential Reward </span>
                  <strong>₹{rewardAmount.toFixed(2)}</strong>
                </div>

                {allTargetsComplete ? (
                  <div className="earning-completed">
                    🎉 All targets completed!
                  </div>
                ) : (
                  <p className="earning-pending">
                    Complete all three targets to unlock earning.
                  </p>
                )}

                {props.earningRequested ? (
                  <p className="earning-pending">
                    Your earning request is already submitted. Status: Pending.
                  </p>
                ) : (
                  <button
                    type="button"
                    className="request-earning-btn"
                    disabled={!allTargetsComplete}
                    onClick={() => setShowPaymentPopup(true)}
                  >
                    {allTargetsComplete
                      ? '💰 Request Earning'
                      : '🔒 Complete Targets First'}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Payment Details Popup - also rendered outside the image card */}
      {showPaymentPopup && props.canDelete &&
        createPortal(
          <div
            style={{
              ...overlayStyle,
              zIndex: 1000000,
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget && !requesting) {
                setShowPaymentPopup(false);
              }
            }}
          >
            <div
              style={popupStyle}
              role="dialog"
              aria-modal="true"
              aria-labelledby="earning-popup-title"
            >
              <button
                type="button"
                onClick={() => setShowPaymentPopup(false)}
                disabled={requesting}
                aria-label="Close popup"
                style={closeButtonStyle}
              >
                ×
              </button>

              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: '#e8f8ef',
                    color: '#159957',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    margin: '0 auto 14px',
                  }}
                >
                  ₹
                </div>

                <h2
                  id="earning-popup-title"
                  style={{
                    fontSize: '23px',
                    margin: '0 0 7px',
                    color: '#172033',
                  }}
                >
                  Request Your Reward
                </h2>

                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                  Add your payment details to submit your request.
                </p>
              </div>

              <div
                style={{
                  background: '#f0fbf5',
                  border: '1px solid #cceedd',
                  borderRadius: '15px',
                  padding: '15px',
                  textAlign: 'center',
                  marginBottom: '22px',
                }}
              >
                <p style={{ margin: '0 0 5px', color: '#527565', fontSize: '13px' }}>
                  Your reward amount
                </p>

                <strong style={{ fontSize: '30px', color: '#159957' }}>
                  ₹{rewardAmount.toFixed(2)}
                </strong>

                <p style={{ margin: '5px 0 0', color: '#527565', fontSize: '12px' }}>
                  All earning targets completed ✓
                </p>
              </div>

              <form onSubmit={handleRequestEarning}>
                <label
                  htmlFor="earning-upi"
                  style={{ fontSize: '13px', fontWeight: 'bold' }}
                >
                  UPI ID
                </label>

                <input
                  id="earning-upi"
                  type="text"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="example@upi"
                  required
                  style={inputStyle}
                />

                <label
                  htmlFor="earning-phone"
                  style={{ fontSize: '13px', fontWeight: 'bold' }}
                >
                  Mobile Number
                </label>

                <input
                  id="earning-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(
                      event.target.value.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  placeholder="Enter 10-digit mobile number"
                  required
                  maxLength={10}
                  style={inputStyle}
                />

                <button
                  type="submit"
                  disabled={requesting}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: 'none',
                    borderRadius: '13px',
                    background: requesting
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #16a36a, #087c4b)',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: requesting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 7px 18px rgba(16, 163, 106, 0.25)',
                  }}
                >
                  {requesting ? 'Submitting...' : 'Submit Earning Request →'}
                </button>

                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#94a3b8',
                    margin: '14px 0 0',
                  }}
                >
                  Your request will be submitted for admin review.
                </p>
              </form>
            </div>
          </div>,
          document.body
        )}

    </div>
  );
}

export default Card;
