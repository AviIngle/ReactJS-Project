
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function AdminEarnings({ onClose }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('earning_requests')
      .select(
        'id, image_id, user_id, upi_id, phone_number, requested_amount, status, created_at, paid_at, rejected_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Requests loading error:', error.message);
      alert('Requests load nahi hui: ' + error.message);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Approve / Reject request
  const updateStatus = async (requestId, newStatus) => {
    const confirmed = window.confirm(
      `Kya aap is request ko ${newStatus} karna chahte hain?`
    );

    if (!confirmed) return;

    setUpdatingId(requestId);

    try {
      const { error } = await supabase.rpc(
        'update_earning_request_status',
        {
          p_request_id: requestId,
          p_status: newStatus,
        }
      );

      if (error) throw error;

      alert(`Request ${newStatus} successfully!`);
      await fetchRequests();
    } catch (error) {
      console.error('Status update error:', error.message);
      alert('Status update nahi hua: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Mark payment done
  const markPaymentDone = async (requestId) => {
    const confirmed = window.confirm(
      'Kya aapne is user ko UPI payment kar di hai? Payment Done mark karne ke baad 5 din mein request automatically delete ho jayegi.'
    );

    if (!confirmed) return;

    setUpdatingId(requestId);

    try {
      const { error } = await supabase.rpc(
        'mark_earning_payment_done',
        {
          p_request_id: requestId,
        }
      );

      if (error) throw error;

      alert('Payment Done successfully! 5 din ka timer shuru ho gaya hai.');
      await fetchRequests();
    } catch (error) {
      console.error('Payment update error:', error.message);
      alert('Payment status update nahi hua: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests =
    filter === 'All'
      ? requests
      : requests.filter((request) => request.status === filter);

  const pendingCount = requests.filter(
    (request) => request.status === 'Pending'
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === 'Approved'
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === 'Rejected'
  ).length;

  const paymentDoneCount = requests.filter(
    (request) => request.status === 'Payment Done'
  ).length;

  const buttonStyle = {
    padding: '9px 14px',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleString();
  };

  const statusColor = (status) => {
    if (status === 'Approved') return '#198754';
    if (status === 'Rejected') return '#dc3545';
    if (status === 'Payment Done') return '#087f5b';
    return '#d97706';
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '15px',
      }}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            position: 'sticky',
            top: '-20px',
            background: '#fff',
            padding: '10px 0',
            zIndex: 2,
            borderBottom: '1px solid #eee',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '21px' }}>
            💰 Earning Requests
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              ...buttonStyle,
              background: '#dc3545',
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Request counts */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            margin: '20px 0',
          }}
        >
          <div>All: <strong>{requests.length}</strong></div>
          <div>Pending: <strong>{pendingCount}</strong></div>
          <div>Approved: <strong>{approvedCount}</strong></div>
          <div>Rejected: <strong>{rejectedCount}</strong></div>
          <div>
            Payment Done: <strong>{paymentDoneCount}</strong>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {[
            'All',
            'Pending',
            'Approved',
            'Rejected',
            'Payment Done',
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              style={{
                padding: '9px 15px',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                background: filter === status ? '#222' : '#e8e8e8',
                color: filter === status ? '#fff' : '#222',
              }}
            >
              {status}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchRequests}
            style={{
              padding: '9px 15px',
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Request list */}
        {loading ? (
          <p>Loading earning requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p>
            No {filter === 'All' ? '' : filter.toLowerCase()} requests found.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  padding: '16px',
                  overflowWrap: 'anywhere',
                }}
              >
                <h3>Request #{request.id.slice(0, 8)}</h3>

                <p>
                  <strong>Amount:</strong> ₹
                  {Number(request.requested_amount).toFixed(2)}
                </p>

                <p><strong>UPI ID:</strong> {request.upi_id}</p>
                <p><strong>Mobile:</strong> {request.phone_number}</p>
                <p><strong>User ID:</strong> {request.user_id}</p>
                <p><strong>Image ID:</strong> {request.image_id}</p>

                <p>
                  <strong>Request Date:</strong>{' '}
                  {formatDate(request.created_at)}
                </p>

                {request.paid_at && (
                  <p>
                    <strong>Payment Date:</strong>{' '}
                    {formatDate(request.paid_at)}
                  </p>
                )}

                {request.rejected_at && (
                  <p>
                    <strong>Rejection Date:</strong>{' '}
                    {formatDate(request.rejected_at)}
                  </p>
                )}

                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: statusColor(request.status),
                    }}
                  >
                    {request.status}
                  </span>
                </p>

                {/* Pending actions */}
                {request.status === 'Pending' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      disabled={updatingId === request.id}
                      onClick={() =>
                        updateStatus(request.id, 'Approved')
                      }
                      style={{
                        ...buttonStyle,
                        background: '#198754',
                      }}
                    >
                      {updatingId === request.id
                        ? 'Updating...'
                        : 'Approve'}
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === request.id}
                      onClick={() =>
                        updateStatus(request.id, 'Rejected')
                      }
                      style={{
                        ...buttonStyle,
                        background: '#dc3545',
                      }}
                    >
                      {updatingId === request.id
                        ? 'Updating...'
                        : 'Reject'}
                    </button>
                  </div>
                )}

                {/* Approved request payment action */}
                {request.status === 'Approved' && (
                  <button
                    type="button"
                    disabled={updatingId === request.id}
                    onClick={() => markPaymentDone(request.id)}
                    style={{
                      ...buttonStyle,
                      background: '#087f5b',
                      marginTop: '8px',
                    }}
                  >
                    {updatingId === request.id
                      ? 'Updating...'
                      : '✓ Mark Payment Done'}
                  </button>
                )}

                {request.status === 'Payment Done' && (
                  <p
                    style={{
                      color: '#087f5b',
                      fontWeight: 'bold',
                      marginTop: '12px',
                    }}
                  >
                    ✓ Payment completed successfully
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminEarnings;
