import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

function SubmitClaim() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfAlreadyClaimed();
  }, [id]);

  const checkIfAlreadyClaimed = async () => {
    try {
      const res = await api.get('/claims/my');
      const exists = res.data.some(c => c.item_id === parseInt(id));
      setAlreadyClaimed(exists);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (alreadyClaimed) {
      alert("You already claimed this item");
      return;
    }
    if (!message.trim()) {
      alert("Please provide details proving this item is yours");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    data.append('item_id', id);
    data.append('message', message);
    if (proofImage) {
      data.append('proof_image', proofImage);
    }

    try {
      await api.post('/claims', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Claim submitted successfully! The poster will review your request.');
      navigate('/my-claims');
    } catch (err) {
      alert('Failed to submit claim: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link to={`/item/${id}`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Item
        </Link>
      </div>

      <div className="page-header-desktop">
        <div>
          <h1>Submit Ownership Claim</h1>
          <p>Provide identifying features, serial numbers, or proof of ownership to recover your belonging</p>
        </div>
      </div>

      {checking ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
        </div>
      ) : (
        <div className="desktop-card" style={{ padding: '36px 40px' }}>
          <div style={{ background: '#e0e7ff', padding: '16px 20px', borderRadius: 16, color: '#3730a3', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>Verification Guidance:</strong>
            Please provide specific characteristics known only to the true owner (e.g. wallpaper picture, password clues, contents inside, purchase receipts, or scratches) so the finder can confidently verify you.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                Your Proof Details *
              </label>
              <textarea 
                className="input-field" 
                rows="5" 
                placeholder="Explain specific identifying features, purchase date, or describe what is inside..." 
                value={message} 
                onChange={e => setMessage(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                Supporting Photo or Receipt (Optional)
              </label>
              <div 
                className="image-picker-box" 
                style={{ height: 160 }}
                onClick={() => document.getElementById('claim-file').click()}
              >
                <input type="file" id="claim-file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                {proofImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={URL.createObjectURL(proofImage)} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setProofImage(null); }}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <span className="material-icons" style={{ fontSize: 16 }}>close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="material-icons" style={{ fontSize: 36, color: '#94a3b8' }}>receipt_long</span>
                    <span style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: '#475569' }}>Attach purchase receipt or photo reference</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>PNG, JPG or WEBP up to 5MB</span>
                  </>
                )}
              </div>
            </div>

            {alreadyClaimed && (
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
                You have already submitted a verification claim for this item.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
              <Link to={`/item/${id}`} className="btn-black" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                Cancel
              </Link>
              <button 
                className="btn-primary" 
                type="submit"
                disabled={alreadyClaimed || loading}
                style={{ padding: '14px 32px', fontSize: 15 }}
              >
                {loading ? 'Submitting Claim...' : 'Submit Claim Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SubmitClaim;
