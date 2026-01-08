import React, { useState, useEffect } from 'react'
import { AppState } from '../App'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const RPRegistration: React.FC<Props> = ({ appState, navigate }) => {
  const [rpData, setRpData] = useState<any>(null);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    const data = appState.casperAuth.getRPData();
    setRpData(data);
  }, []);

  const formatPublicKey = async (key: CryptoKey): Promise<string> => {
    try {
      const exported = await crypto.subtle.exportKey('spki', key);
      const bytes = new Uint8Array(exported);
      return Array.from(bytes.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ') + '...';
    } catch {
      return 'Key export failed';
    }
  };

  const [realKeyDisplays, setRealKeyDisplays] = useState<string[]>([]);
  const [trapKeyDisplays, setTrapKeyDisplays] = useState<string[]>([]);

  useEffect(() => {
    if (rpData && showKeys) {
      Promise.all(rpData.realPublicKeys.map(formatPublicKey))
        .then(setRealKeyDisplays);
      Promise.all(rpData.trapPublicKeys.map(formatPublicKey))
        .then(setTrapKeyDisplays);
    }
  }, [rpData, showKeys]);

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="fade-in">
      <div className="card genuine-mode">
        <h2>🏛️ Relying Party Registration</h2>
        
        <div className="alert alert-info">
          <h4>Step 6: RP Key Storage Setup</h4>
          <p>
            The Relying Party (RP) stores two distinct sets of public keys: 
            real keys (V) for genuine users and trap keys (V') for breach detection.
          </p>
        </div>

        {rpData && (
          <div className="fade-in">
            <div className="alert alert-success">
              <h4>✅ RP Registration Complete</h4>
              <p>Public keys successfully registered with separation between real and trap keys</p>
            </div>

            <div className="grid">
              <div className="card" style={{ background: '#e8f5e8', border: '2px solid #4CAF50' }}>
                <h4>✅ Real Public Keys (V)</h4>
                <p>
                  <strong>Count:</strong> {rpData.realPublicKeys.length} key(s)<br/>
                  <strong>Purpose:</strong> Verify genuine user signatures<br/>
                  <strong>Source:</strong> Derived from real private key (s)
                </p>
                
                <div style={{ marginTop: '15px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowKeys(!showKeys)}
                  >
                    {showKeys ? 'Hide Keys' : 'Show Keys'}
                  </button>
                </div>

                {showKeys && realKeyDisplays.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    {realKeyDisplays.map((keyDisplay, index) => (
                      <div key={index} className="crypto-display genuine-mode">
                        <strong>V{index + 1}:</strong> {keyDisplay}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ background: '#f8d7da', border: '2px solid #f44336' }}>
                <h4>🚨 Trap Public Keys (V')</h4>
                <p>
                  <strong>Count:</strong> {rpData.trapPublicKeys.length} key(s)<br/>
                  <strong>Purpose:</strong> Detect unauthorized access<br/>
                  <strong>Source:</strong> Derived from decoy private keys
                </p>

                {showKeys && trapKeyDisplays.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    {trapKeyDisplays.map((keyDisplay, index) => (
                      <div key={index} className="crypto-display attacker-mode">
                        <strong>V'{index + 1}:</strong> {keyDisplay}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
              <h4>🔍 Breach Detection Logic</h4>
              <div className="grid">
                <div>
                  <h5>✅ Genuine User Path</h5>
                  <ol style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                    <li>User enters correct PIN</li>
                    <li>PIN selects real secret (w*)</li>
                    <li>Correct encryption key derived</li>
                    <li>Real private key decrypted</li>
                    <li>Signature verifies against V</li>
                    <li><strong>Login succeeds</strong></li>
                  </ol>
                </div>
                <div>
                  <h5>🚨 Attacker Path</h5>
                  <ol style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                    <li>Attacker has cloud data but no PIN</li>
                    <li>Random secret selection from W</li>
                    <li>Wrong encryption key derived</li>
                    <li>Garbage private key decryption</li>
                    <li>Forced to use decoy keys</li>
                    <li><strong>Signature verifies against V' → BREACH!</strong></li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: '#e8f4fd' }}>
              <h4>🔐 Key Separation Properties</h4>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Property</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Real Keys (V)</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Trap Keys (V')</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Used by genuine user</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓ Always</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗ Never</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Used by attacker</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗ Cannot access</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓ Forced to use</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Triggers breach alert</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>✗ No</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓ Immediate</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Cryptographically valid</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓ Yes</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>✓ Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="alert alert-warning">
              <h4>🎯 Critical CASPER Insight</h4>
              <p>
                The trap keys (V') are <strong>indistinguishable</strong> from real keys (V) 
                from a cryptographic perspective. They produce valid signatures and appear 
                legitimate. The only difference is their <strong>usage context</strong> - 
                genuine users never use them, while attackers are forced to use them.
              </p>
            </div>

            <div className="card" style={{ background: '#f0f8ff' }}>
              <h4>📊 RP Storage Architecture</h4>
              <div className="grid">
                <div>
                  <h5>Database Schema</h5>
                  <div className="crypto-display">
                    <strong>users_real_keys:</strong><br/>
                    - user_id: {appState.username}<br/>
                    - public_key: V1, V2, ...<br/>
                    - key_type: 'genuine'
                  </div>
                </div>
                <div>
                  <h5>Trap Detection</h5>
                  <div className="crypto-display">
                    <strong>users_trap_keys:</strong><br/>
                    - user_id: {appState.username}<br/>
                    - public_key: V'1, V'2, ...<br/>
                    - key_type: 'trap'
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                Continue to Normal Login →
              </button>
            </div>
          </div>
        )}

        {!rpData && (
          <div className="alert alert-danger">
            <h4>❌ No RP Data Available</h4>
            <p>CASPER system not properly initialized. Please restart the setup process.</p>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
          <h4>🔬 Academic Significance</h4>
          <p>
            This RP registration demonstrates a key innovation of CASPER: the ability to 
            detect breaches through <strong>behavioral analysis</strong> rather than just 
            cryptographic failure. Traditional systems fail silently when compromised, 
            but CASPER actively signals when unauthorized access occurs.
          </p>
          
          <div className="alert alert-info" style={{ marginTop: '15px' }}>
            <strong>Research Contribution:</strong> CASPER transforms authentication from 
            a binary success/failure model to a three-state model: success, failure, and 
            <strong>detected compromise</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RPRegistration;