import React, { useState, useEffect } from 'react'
import { AppState } from '../App'
import { selectSecret } from '../crypto/casper'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const VaultInitialization: React.FC<Props> = ({ appState, setAppState, navigate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [detectionSecrets, setDetectionSecrets] = useState<Uint8Array[]>([]);
  const [realSecretIndex, setRealSecretIndex] = useState<number>(-1);
  const [selectedSecret, setSelectedSecret] = useState<Uint8Array | null>(null);

  const generateSecrets = async () => {
    setIsGenerating(true);
    
    // Simulate generation process with animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Initialize CASPER system
    await appState.casperAuth.initialize(appState.userPin);
    
    // Get the generated secrets for display
    const secrets = appState.casperAuth.getDetectionSecrets();
    if (secrets) {
      setDetectionSecrets(secrets.W);
      setRealSecretIndex(secrets.realSecretIndex);
      
      // Demonstrate PIN-based selection
      const selected = selectSecret(secrets.W, appState.userPin);
      setSelectedSecret(selected);
    }
    
    setIsGenerating(false);
    setGenerationComplete(true);
  };

  useEffect(() => {
    if (!appState.userPin) {
      navigate('/setup');
      return;
    }
    generateSecrets();
  }, []);

  const formatBytes = (bytes: Uint8Array): string => {
    return Array.from(bytes.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') + '...';
  };

  const handleContinue = () => {
    navigate('/encryption');
  };

  return (
    <div className="fade-in">
      <div className="card genuine-mode">
        <h2>🔧 Vault Initialization</h2>
        
        <div className="alert alert-info">
          <h4>Step 2: Detection Secret Generation</h4>
          <p>
            Generating k ≥ 5 cryptographically random detection secrets. Only one will be the 
            real secret (w*), selected deterministically by your PIN.
          </p>
        </div>

        {isGenerating && (
          <div className="animation-container">
            <div className="spinning" style={{ fontSize: '48px', marginBottom: '20px' }}>
              🔄
            </div>
            <h3>Generating Detection Secrets...</h3>
            <p>Creating cryptographically random 256-bit secrets</p>
          </div>
        )}

        {generationComplete && (
          <div className="fade-in">
            <div className="alert alert-success">
              <h4>✅ Detection Secrets Generated</h4>
              <p>Successfully created {detectionSecrets.length} detection secrets</p>
            </div>

            <div className="card" style={{ background: '#f8f9fa' }}>
              <h4>🔐 Detection Secret Set (W)</h4>
              <p style={{ marginBottom: '15px' }}>
                Each secret is 256 bits of cryptographically random data:
              </p>
              
              {detectionSecrets.map((secret, index) => (
                <div 
                  key={index}
                  className={`crypto-display ${index === realSecretIndex ? 'genuine-mode' : ''}`}
                  style={{ 
                    marginBottom: '8px',
                    background: index === realSecretIndex ? '#e8f5e8' : '#f8f9fa'
                  }}
                >
                  <strong>w{index + 1}:</strong> {formatBytes(secret)}
                  {index === realSecretIndex && (
                    <span style={{ color: '#4CAF50', marginLeft: '10px' }}>
                      ← Real Secret (w*)
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
              <h4>🎯 PIN-Based Secret Selection</h4>
              <p>
                Your PIN <code>{appState.userPin}</code> deterministically selects secret 
                <strong> w{realSecretIndex + 1}</strong> as the real secret (w*).
              </p>
              
              {selectedSecret && (
                <div className="crypto-display genuine-mode">
                  <strong>Selected w*:</strong> {formatBytes(selectedSecret)}
                </div>
              )}
              
              <div className="alert alert-warning" style={{ marginTop: '15px' }}>
                <strong>Critical Security Property:</strong> Only you know which secret is real. 
                The PMS and any attacker see all secrets but cannot determine w* without your PIN.
              </div>
            </div>

            <div className="card">
              <h4>🔬 CASPER Algorithm Progress</h4>
              <div className="grid">
                <div>
                  <h5>✅ Completed Steps</h5>
                  <ul style={{ paddingLeft: '20px' }}>
                    <li>User PIN (η) creation</li>
                    <li>Detection secrets W generation</li>
                    <li>Real secret w* selection</li>
                  </ul>
                </div>
                <div>
                  <h5>🔄 Next Steps</h5>
                  <ul style={{ paddingLeft: '20px' }}>
                    <li>Private key generation (s)</li>
                    <li>HKDF key derivation (u)</li>
                    <li>XOR encryption (s̃ = u ⊕ s)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                Continue to Encryption Engine →
              </button>
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px', background: '#f0f8ff' }}>
          <h4>🛡️ Security Analysis</h4>
          <div className="grid">
            <div>
              <h5>Genuine User Advantage</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Knows PIN → Selects correct w*</li>
                <li>Derives correct encryption key</li>
                <li>Decrypts real private key</li>
                <li>Signs with genuine key</li>
              </ul>
            </div>
            <div>
              <h5>Attacker Disadvantage</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>No PIN → Random secret selection</li>
                <li>Wrong encryption key derivation</li>
                <li>Garbage private key decryption</li>
                <li>Forces use of decoy keys</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultInitialization;