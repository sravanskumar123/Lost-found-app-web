import React from 'react';

function ItemLifecycleStepper({ 
  status = 'active', 
  hasClaim = false, 
  claimStatus = null, 
  isOwner = false,
  title = null
}) {
  const normClaimStatus = (claimStatus || '').toLowerCase();
  const isRejected = normClaimStatus === 'rejected';
  const isApproved = normClaimStatus === 'approved';
  const isReturned = (status || '').toLowerCase() === 'returned';

  // Determine current step index (1-based: 1, 2, 3, 4)
  let currentStep = 1;

  if (isReturned) {
    currentStep = 4;
  } else if (isApproved) {
    currentStep = 3;
  } else if (isRejected || normClaimStatus === 'pending' || status === 'claimed' || hasClaim) {
    currentStep = 2;
  } else {
    currentStep = 1;
  }

  const steps = [
    {
      step: 1,
      title: 'Reported & Listed',
      subtitle: 'Visible to campus community',
      icon: 'post_add'
    },
    {
      step: 2,
      title: isRejected ? 'Verification Declined' : 'Claim Under Review',
      subtitle: isRejected ? 'Proof was not accepted' : 'Proof & answers submitted',
      icon: isRejected ? 'cancel' : 'rate_review'
    },
    {
      step: 3,
      title: 'Verified & Approved',
      subtitle: 'Handover authorized',
      icon: 'verified_user'
    },
    {
      step: 4,
      title: 'Recovered & Returned',
      subtitle: 'Safely handed over to owner',
      icon: 'task_alt'
    }
  ];

  const getGuidanceText = () => {
    if (isRejected) {
      return {
        title: "Claim Resolution: Verification Declined",
        desc: isOwner 
          ? "You declined this claim request. The claimant has been notified that ownership proof could not be verified."
          : "The poster reviewed your verification proof and could not confirm genuine ownership. This claim has been declined and closed.",
        badge: "Claim Rejected",
        color: "#c25450",
        bg: "#fdf4f3",
        border: "#f5cfcc"
      };
    }

    if (isReturned) {
      return {
        title: "Step 4 of 4: Recovery Complete",
        desc: "This item has been successfully reunited with its rightful owner. Case closed!",
        badge: "Case Closed & Returned",
        color: "#0e6c4e",
        bg: "#edf9f4",
        border: "#b2e3d3"
      };
    }

    if (isApproved) {
      return {
        title: "Step 3 of 4: Ownership Verified - Ready for Handover",
        desc: isOwner
          ? "You approved this claim! Please coordinate with the claimant using their contact phone to arrange safe handover on campus."
          : "Your ownership claim has been verified and approved! You can now call the poster directly using the revealed phone number below to arrange pickup.",
        badge: "Claim Approved & Verified",
        color: "#107e5b",
        bg: "#edf9f4",
        border: "#b2e3d3"
      };
    }

    if (normClaimStatus === 'pending' || hasClaim || status === 'claimed') {
      return {
        title: "Step 2 of 4: Claim Under Verification",
        desc: isOwner 
          ? "A claim has been filed for this item. Please review the claimant's answers in 'Review Item Claims' to verify legitimate ownership."
          : "Your claim has been submitted. The poster is currently reviewing your verification details and answers.",
        badge: "Verification in Progress",
        color: "#b47836",
        bg: "#fffbeb",
        border: "#fde68a"
      };
    }

    return {
      title: "Step 1 of 4: Public Campus Listing Active",
      desc: "This item is listed in the campus directory. Anyone who lost or found it can inspect details or submit an ownership claim with identifying proof.",
      badge: "Awaiting Claims & Matches",
      color: "#1b382f",
      bg: "#eaf0ec",
      border: "#dde5e0"
    };
  };

  const guidance = getGuidanceText();

  return (
    <div style={{
      background: 'white',
      borderRadius: 18,
      padding: '24px 28px',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 24
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            {normClaimStatus ? 'Claim Verification Tracking' : 'Recovery Lifecycle Tracking'}
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: 17, fontWeight: 800, color: '#0f2942' }}>
            {title || (normClaimStatus ? 'Claim Resolution Status' : 'Item Status Progress')}
          </h3>
        </div>

        {guidance && (
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 6,
            background: guidance.bg,
            color: guidance.color,
            border: `1px solid ${guidance.border || guidance.color + '33'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: guidance.color, display: 'inline-block' }}></span>
            {guidance.badge}
          </span>
        )}
      </div>

      {/* 4-Step Stepper Bar */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '20px 0 24px 0' }}>
        {/* Background Connecting Line */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: '5%',
          right: '5%',
          height: 3,
          background: '#e4e4e7',
          zIndex: 1,
          borderRadius: 2
        }} />

        {/* Progress Filled Line */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: '5%',
          width: isRejected ? '30%' : `${((currentStep - 1) / (steps.length - 1)) * 90}%`,
          height: 3,
          background: isRejected ? 'linear-gradient(90deg, #107e5b 0%, #c25450 100%)' : 'var(--found-gradient)',
          zIndex: 2,
          borderRadius: 2,
          transition: 'width 0.4s ease'
        }} />

        {/* Steps Nodes */}
        {steps.map((s) => {
          const isNodeRejected = isRejected && s.step === 2;
          const isCompleted = isRejected ? s.step === 1 : s.step < currentStep;
          const isCurrent = isRejected ? s.step === 2 : s.step === currentStep;

          let nodeBg = '#eaf0ec';
          let nodeColor = '#64748b';
          let nodeBorder = '1.5px solid #dde5e0';
          let nodeShadow = 'none';

          if (isNodeRejected) {
            nodeBg = '#fdf4f3';
            nodeColor = '#c25450';
            nodeBorder = '2px solid #c25450';
            nodeShadow = '0 0 0 3px rgba(194, 84, 80, 0.15)';
          } else if (isCompleted) {
            nodeBg = 'var(--found-gradient)';
            nodeColor = 'white';
            nodeBorder = 'none';
          } else if (isCurrent) {
            nodeBg = 'var(--primary)';
            nodeColor = 'white';
            nodeBorder = '2px solid var(--primary)';
            nodeShadow = '0 0 0 3px rgba(27, 56, 47, 0.15)';
          }

          return (
            <div key={s.step} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%', textAlign: 'center' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: nodeBg,
                color: nodeColor,
                border: nodeBorder,
                boxShadow: nodeShadow,
                transition: 'all 0.25s ease',
                marginBottom: 8
              }}>
                <span className="material-icons" style={{ fontSize: 18 }}>
                  {isCompleted ? 'check' : s.icon}
                </span>
              </div>

              <div style={{
                fontSize: 13,
                fontWeight: isCurrent || isNodeRejected ? 800 : 700,
                color: isNodeRejected ? '#c25450' : isCurrent ? '#1b382f' : isCompleted ? '#107e5b' : '#64748b',
                marginBottom: 2
              }}>
                {s.title}
              </div>

              <div style={{ fontSize: 11, color: isNodeRejected ? '#a8413d' : '#94a3b8', maxWidth: 120, lineHeight: 1.2 }}>
                {s.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Action & Guidance Callout */}
      {guidance && (
        <div style={{
          background: guidance.bg,
          borderLeft: `4px solid ${guidance.color}`,
          borderRadius: '0 12px 12px 0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span className="material-icons" style={{ color: guidance.color, fontSize: 24, flexShrink: 0 }}>
            {isRejected ? 'error_outline' : isApproved ? 'verified' : 'lightbulb'}
          </span>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
            <strong style={{ color: '#0f172a' }}>{guidance.title}: </strong>
            {guidance.desc}
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemLifecycleStepper;

