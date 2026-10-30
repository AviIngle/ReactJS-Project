
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
        'id, image_id, user_id, upi_id, phone_number, requested_amount, status, created_at'
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
              border: 'none',
              background: '#dc3545',
              color: '#fff',
              borderRadius: '7px',
              padding: '9px 14px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕ Close
          </button>
        </div>

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
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
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

          <button type="button" onClick={fetchRequests}>
            🔄 Refresh
          </button>
        </div>

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
                  <strong>Date:</strong>{' '}
                  {new Date(request.created_at).toLocaleString()}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{ fontWeight: 'bold' }}>
                    {request.status}
                  </span>
                </p>

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
                      onClick={() => updateStatus(request.id, 'Approved')}
                      style={{
                        padding: '9px 14px',
                        background: '#198754',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {updatingId === request.id ? 'Updating...' : 'Approve'}
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === request.id}
                      onClick={() => updateStatus(request.id, 'Rejected')}
                      style={{
                        padding: '9px 14px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {updatingId === request.id ? 'Updating...' : 'Reject'}
                    </button>
                  </div>
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
