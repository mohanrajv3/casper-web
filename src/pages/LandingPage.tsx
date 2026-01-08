import React from 'react'
import { AppState } from '../App'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const LandingPage: React.FC<Props> = ({ navigate }) => {
  return (
    <div className="fade-in">
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          🔐 CASPER-Based Web Authenticator
        </h1>
        
        <div className="alert alert-info">
          <h3>Research-Grade Implementation</h3>
          <p>
            This is a complete implementation of the CASPER algorithm for academic review and security evaluation. 
            The system demonstrates real cryptographic operations, breach detection, and authenticator functionality.
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h3>🛡️ Security Guarantees</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>PIN Privacy:</strong> PIN never leaves browser, never stored in cloud</li>
              <li><strong>Breach Detection:</strong> Automatic detection when cloud data is compromised</li>
              <li><strong>Real Cryptography:</strong> ECDSA signatures, HKDF key derivation, XOR encryption</li>
              <li><strong>Decoy Protection:</strong> Trap keys immediately signal unauthorized access</li>
            </ul>
          </div>

          <div className="card">
            <h3>🔬 CASPER Algorithm Features</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>Detection Secrets (W):</strong> k ≥ 5 cryptographically random secrets</li>
              <li><strong>PIN-Based Selection:</strong> Deterministic secret selection using user PIN</li>
              <li><strong>HKDF Key Derivation:</strong> u = HKDF(w*, z) for encryption</li>
              <li><strong>XOR Encryption:</strong> s̃ = u ⊕ s (exactly as specified)</li>
              <li><strong>Trap Keys:</strong> Decoy public keys in V' for breach detection</li>
            </ul>
          </div>
        </div>

        <div className="card" style={{ background: '#f8f9fa', border: '2px solid #4CAF50' }}>
          <h3>🎯 What This System Demonstrates</h3>
          <div className="grid">
            <div>
              <h4>✅ Fully Operational</h4>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Real key generation & encryption</li>
                <li>Actual CASPER algorithm execution</li>
                <li>Working breach detection logic</li>
                <li>Complete authenticator functionality</li>
              </ul>
            </div>
            <div>
              <h4>✅ Academic Compliance</h4>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Exact algorithm specification match</li>
                <li>No shortcuts or simplifications</li>
                <li>Real cryptographic operations</li>
                <li>Verifiable security properties</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="alert alert-warning">
          <h4>⚠️ Research Implementation Notice</h4>
          <p>
            This is a <strong>CASPER-inspired architecture</strong> for research and academic evaluation. 
            It implements the complete algorithm with real cryptography but is not FIDO-certified or production-ready.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '18px', padding: '15px 30px' }}
            onClick={() => navigate('/setup')}
          >
            🚀 Create CASPER Authenticator Vault
          </button>
        </div>

        <div className="card" style={{ marginTop: '30px', background: '#e8f5e8' }}>
          <h4>🔄 System Flow Preview</h4>
          <p>You will experience:</p>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Authenticator Setup:</strong> Username & PIN creation</li>
            <li><strong>Vault Initialization:</strong> Detection secrets generation</li>
            <li><strong>Encryption Engine:</strong> HKDF + XOR encryption demonstration</li>
            <li><strong>Cloud PMS View:</strong> See exactly what gets uploaded</li>
            <li><strong>Password & Passkey Vault:</strong> Secure credential storage</li>
            <li><strong>RP Registration:</strong> Real vs trap key separation</li>
            <li><strong>Normal Login:</strong> Genuine user authentication</li>
            <li><strong>Attacker Mode:</strong> Simulate cloud data compromise</li>
            <li><strong>Breach Detection:</strong> Automatic threat detection</li>
            <li><strong>Algorithm Completion:</strong> Implementation proof</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;