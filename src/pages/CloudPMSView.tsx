import React from 'react'
import { AppState } from '../App'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const CloudPMSView: React.FC<Props> = ({ appState, navigate }) => {
  const cloudData = appState.casperAuth.getCloudData();

  const formatBytes = (bytes: Uint8Array, length: number = 16): string => {
    return Array.from(bytes.slice(0, length))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ') + (bytes.length > length ? '...' : '');
  };

  const handleContinue = () => {
    navigate('/vault');
  };

  return (
    <div className="fade-in">
      <div className="card pms-mode">
        <h2>☁️ Cloud PMS View</h2>
        
        <div className="alert alert-warning">
          <h4>Step 4: Cloud Storage Analysis</h4>
          <p>
            This shows exactly what data is uploaded to the Passkey Management Service (PMS). 
            Notice what the PMS <strong>can see</strong> vs what it <strong>cannot see</strong>.
          </p>
        </div>

        {cloudData && (
          <div className="fade-in">
            <div className="card" style={{ background: '#fff3cd', border: '2px solid #ff9800' }}>
              <h3>📤 Data Uploaded to Cloud PMS</h3>
              <p>The following data is stored in the cloud and visible to the PMS:</p>
              
              <div className="grid">
                <div className="card">
                  <h4>🔒 Encrypted Private Key (s̃)</h4>
                  <div className="crypto-display">
                    {formatBytes(cloudData.encryptedPrivateKey, 20)}
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    XOR-encrypted with HKDF-derived key
                  </p>
                </div>

                <div className="card">
                  <h4>🧂 Salt (z)</h4>
                  <div className="crypto-display">
                    {formatBytes(cloudData.salt, 20)}
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    256-bit random salt for HKDF
                  </p>
                </div>
              </div>

              <div className="card">
                <h4>🔐 Detection Secrets (W)</h4>
                <p>All {cloudData.detectionSecrets.length} detection secrets are visible to PMS:</p>
                {cloudData.detectionSecrets.map((secret, index) => (
                  <div key={index} className="crypto-display" style={{ marginBottom: '8px' }}>
                    <strong>w{index + 1}:</strong> {formatBytes(secret, 12)}
                  </div>
                ))}
                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                  PMS sees all secrets but cannot identify which is real (w*)
                </p>
              </div>
            </div>

            <div className="card" style={{ background: '#f8d7da', border: '2px solid #f44336' }}>
              <h3>🚫 What PMS Cannot See</h3>
              <div className="grid">
                <div className="alert alert-danger">
                  <h4>❌ User PIN (η)</h4>
                  <p>PIN: <code>****</code> (Hidden)</p>
                  <small>Never transmitted or stored in cloud</small>
                </div>

                <div className="alert alert-danger">
                  <h4>❌ Real Secret Identity</h4>
                  <p>Which secret is w*: <code>Unknown to PMS</code></p>
                  <small>Only PIN holder can determine this</small>
                </div>

                <div className="alert alert-danger">
                  <h4>❌ Plain Private Key (s)</h4>
                  <p>Unencrypted key: <code>Not accessible</code></p>
                  <small>Encrypted with PIN-derived key</small>
                </div>

                <div className="alert alert-danger">
                  <h4>❌ Encryption Key (u)</h4>
                  <p>HKDF result: <code>Cannot derive</code></p>
                  <small>Requires knowledge of w*</small>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: '#d4edda', border: '2px solid #4CAF50' }}>
              <h3>🛡️ Security Analysis</h3>
              
              <div className="grid">
                <div>
                  <h4>✅ PMS Compromise Resistance</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>PMS breach reveals only encrypted data</li>
                    <li>No way to identify real secret without PIN</li>
                    <li>Cannot derive correct encryption key</li>
                    <li>Cannot decrypt private key</li>
                  </ul>
                </div>
                
                <div>
                  <h4>🔍 Attacker Limitations</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Must guess which secret is real (1/k chance)</li>
                    <li>Wrong guess → wrong encryption key</li>
                    <li>Wrong key → garbage decryption</li>
                    <li>Forced to use decoy keys → breach detected</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="alert alert-info">
              <h4>🔬 CASPER Algorithm Insight</h4>
              <p>
                This demonstrates the core CASPER principle: <strong>separation of knowledge</strong>. 
                The cloud has the encrypted data, but only the genuine user with the PIN can 
                reconstruct the real private key. Any attacker, even with full cloud access, 
                will be detected when they attempt to use decoy keys.
              </p>
            </div>

            <div className="card" style={{ background: '#e8f4fd' }}>
              <h4>📊 Data Visibility Matrix</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Data Element</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Genuine User</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Cloud PMS</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Attacker</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>PIN (η)</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Detection Secrets (W)</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Real Secret (w*)</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Encrypted Key (s̃)</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Plain Private Key (s)</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                Continue to Vault Dashboard →
              </button>
            </div>
          </div>
        )}

        {!cloudData && (
          <div className="alert alert-danger">
            <h4>❌ No Cloud Data Available</h4>
            <p>CASPER system not properly initialized. Please restart the setup process.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudPMSView;