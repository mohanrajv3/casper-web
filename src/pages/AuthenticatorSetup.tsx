import React, { useState } from 'react'
import { AppState } from '../App'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const AuthenticatorSetup: React.FC<Props> = ({ appState, setAppState, navigate }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    // Update app state
    setAppState(prev => ({
      ...prev,
      username: username.trim(),
      userPin: pin
    }));

    navigate('/vault-init');
  };

  return (
    <div className="fade-in">
      <div className="card genuine-mode">
        <h2>🔐 CASPER Authenticator Setup</h2>
        
        <div className="alert alert-info">
          <h4>Step 1: User Credentials</h4>
          <p>
            Create your authenticator identity. Your PIN is the <strong>critical security component</strong> 
            that selects the real detection secret from the decoy set.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="pin">PIN (4-6 digits)</label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 4-6 digit PIN"
              maxLength={6}
              autoComplete="new-password"
            />
            <small style={{ color: '#666', fontSize: '14px' }}>
              This PIN will be used to deterministically select your real detection secret
            </small>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPin">Confirm PIN</label>
            <input
              type="password"
              id="confirmPin"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm your PIN"
              maxLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <h4>🔒 PIN Security Properties</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>Never transmitted:</strong> PIN stays in your browser only</li>
              <li><strong>Never stored in cloud:</strong> PMS cannot see your PIN</li>
              <li><strong>Deterministic selection:</strong> Same PIN always selects same secret</li>
              <li><strong>Critical for security:</strong> Without PIN, attacker gets decoy keys</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button type="submit" className="btn btn-primary">
              Continue to Vault Initialization →
            </button>
          </div>
        </form>

        <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
          <h4>🧠 CASPER Algorithm Context</h4>
          <p>
            Your PIN (η) is the foundation of CASPER's security model. It enables the 
            <code style={{ background: '#e9ecef', padding: '2px 4px', borderRadius: '3px' }}>
              Select(W, η)
            </code> function to deterministically choose the real secret (w*) from the detection 
            secret set W = {'{w1, w2, w3, w4, w5}'}.
          </p>
          <p style={{ marginTop: '10px' }}>
            <strong>Next:</strong> We'll generate your detection secrets and demonstrate the selection process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatorSetup;