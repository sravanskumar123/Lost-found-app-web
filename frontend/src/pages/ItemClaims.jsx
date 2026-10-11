import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, Link } from 'react-router-dom';
import ItemLifecycleStepper from '../components/ItemLifecycleStepper';

function ItemClaims() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [claimsRes, itemRes] = await Promise.all([
        api.get(`/claims/item/${id}`),
        api.get(`/items/${id}`)
      ]);
      setClaims(claimsRes.data || []);
      setItem(itemRes.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveClaim = async (claimId) => {
    if (!window.confirm("Approve this claim? This will share your phone contact with the claimant and mark the item as claimed.")) return;
    try {
      const res = await api.put(`/claims/${claimId}/approve`);
      alert(res.data.message || "Claim approved!");
      loadData();
    } catch (err) {
      alert("Approve failed");
    }
  };

  const rejectClaim = async (claimId) => {
    if (!window.confirm("Decline this claim?")) return;
    try {
      await api.put(`/claims/${claimId}/reject`);
      loadData();
    } catch (err) {
      alert("Reject failed");
    }
  };

  const markReturned = async () => {
    if (!window.confirm("Confirm that this item has been safely returned to its verified owner?")) return;
    try {
      await api.put(`/items/${id}/mark-returned`);
      alert("Item successfully marked as returned!");
      loadData();
    } catch (err) {
      alert("Failed to mark as returned: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link to="/my-items" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
          Back to My Listings
        </Link>
      </div>

      <div className="page-header-desktop">
        <div>
          <h1>Review Item Claims</h1>
          <p>Inspect ownership proof submitted by campus students and approve verified claimants</p>
        </div>
      </div>

      {(() => {
        const hasApproved = claims.some(c => c.status?.toLowerCase() === 'approved');
        const hasPending = claims.some(c => c.status?.toLowerCase() === 'pending');
        const allRejected = claims.length > 0 && claims.every(c => c.status?.toLowerCase() === 'rejected');
        const computedStatus = hasApproved ? 'approved' : hasPending ? 'pending' : allRejected ? 'rejected' : null;

        return (
          <ItemLifecycleStepper 
            hasClaim={claims.length > 0} 
            claimStatus={computedStatus} 
            isOwner={true} 
            title="Listing Claim Status"
          />
        );
      })()}

      {/* Handover & Return Lifecycle Banner */}
      {item?.status === 'claimed' && (
        <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#065f46', fontSize: 15, fontWeight: 800 }}>
              Claim Approved — Awaiting Handover
            </h4>
            <p style={{ margin: 0, color: '#047857', fontSize: 13 }}>
              Once you have handed over the item to the verified claimant, mark it as returned to complete the recovery.
            </p>
          </div>
          <button 
            type="button"
            onClick={markReturned}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)'
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>task_alt</span>
            Mark as Returned
          </button>
        </div>
      )}

      {item?.status === 'returned' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#166534', fontWeight: 700, fontSize: 14 }}>
          <span className="material-icons" style={{ color: '#16a34a' }}>check_circle</span>
          This item has been successfully returned and resolved!
        </div>
      )}

      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
            <p style={{ marginTop: 12, fontSize: 14 }}>Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24, border: '1px solid var(--border-light)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <span className="material-icons" style={{ fontSize: 36, color: '#94a3b8' }}>verified</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>No claim requests yet</h3>
            <p style={{ fontSize: 14, margin: 0, color: '#64748b' }}>When students submit ownership proof, their claims will appear here for your review.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {claims.map(claim => (
              <div key={claim.id} className="desktop-card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {claim.name || "Campus Student"}
                    </h3>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{claim.email || "Registered Student"}</div>
                  </div>
                  <span style={{ 
                    padding: '6px 14px', 
                    background: claim.status === 'approved' ? '#ecfdf5' : (claim.status === 'rejected' ? '#fef2f2' : '#fffbeb'), 
                    color: claim.status === 'approved' ? '#059669' : (claim.status === 'rejected' ? '#e11d48' : '#d97706'), 
                    borderRadius: 20, 
                    fontSize: 12, 
                    fontWeight: 800, 
                    textTransform: 'uppercase' 
                  }}>
                    {claim.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 18px', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Number</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{claim.phone || "No phone provided"}</div>
                  </div>
                  {claim.phone && (
                    <a href={`tel:${claim.phone}`} style={{ textDecoration: 'none' }}>
                      <button style={{
                        padding: '8px 16px',
                        borderRadius: 12,
                        background: 'var(--found-gradient)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}>
                        <span className="material-icons" style={{ fontSize: 16 }}>call</span>
                        Call Claimant
                      </button>
                    </a>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 18, fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Ownership Proof Submitted</div>
                  {claim.message || "No description provided."}
                </div>

                {claim.proof_image && (
                  <div style={{ marginBottom: 18 }}>
                    <img 
                      src={`http://localhost:5000/uploads/${claim.proof_image}`} 
                      alt="Proof" 
                      style={{ maxHeight: 240, maxWidth: '100%', objectFit: 'contain', borderRadius: 14, border: '1px solid #e2e8f0' }} 
                    />
                  </div>
                )}

                {claim.status === "approved" ? (
                  <div style={{ background: '#ecfdf5', color: '#059669', padding: '14px 18px', borderRadius: 14, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-icons" style={{ fontSize: 22 }}>check_circle</span>
                    Claim Approved — Phone contact shared: {claim.phone || "On File"}
                  </div>
                ) : claim.status === "pending" ? (
                  <div style={{ display: 'flex', gap: 14 }}>
                    <button 
                      onClick={() => approveClaim(claim.id)}
                      className="btn-primary"
                      style={{ background: 'var(--found-gradient)', padding: '12px 24px' }}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>check</span>
                      Approve Ownership Claim
                    </button>
                    <button 
                      onClick={() => rejectClaim(claim.id)}
                      style={{ padding: '12px 24px', background: '#ffffff', color: '#e11d48', border: '1.5px solid #fecdd3', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>close</span>
                      Decline Claim
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', padding: '12px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-icons" style={{ fontSize: 20, color: '#c2410c' }}>cancel</span>
                    This claim was declined. Claimant cannot view contact number or collect the item under this request.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemClaims;
