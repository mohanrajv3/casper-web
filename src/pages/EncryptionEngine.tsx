import React, { useState, useEffect } from 'react'
import { AppState } from '../App'
import { selectSecret, deriveEncryptionKey, xorEncrypt } from '../crypto/casper'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const EncryptionEngine: React.FC<Props> = ({ appState, setAppState, navigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [realSecret, setRealSecret] = useState<Uint8Array | null>(null);
  const [salt, setSalt] = useState<Uint8Array | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);
  const [privateKeyRaw, setPrivateKeyRaw] = useState<Uint8Array | null>(null);
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    'Secret Selection',
    'Salt Generation', 
    'HKDF Derivation',
    'Private Key Export',
    'XOR Encryption'
  ];

  const executeEncryption = async () => {
    setIsProcessing(true);

    // Step 1: Select real secret using PIN
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const secrets = appState.casperAuth.getDetectionSecrets();
    if (!secrets) return;
    
    const selected = selectSecret(secrets.W, appState.userPin);
    setRealSecret(selected);

    // Step 2: Get salt from cloud data
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const cloudData = appState.casperAuth.getCloudData();
    if (!cloudData) return;
    
    setSalt(cloudData.salt);

    // Step 3: HKDF key derivation
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const derivedKey = await deriveEncryptionKey(selected, cloudData.salt);
    setEncryptionKey(derivedKey);

    // Step 4: Export private key
    setCurrentStep(3);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get the real key pair from CASPER auth
    const rpData = appState.casperAuth.getRPData();
    if (!rpData || !rpData.realPublicKeys.length) return;
    
    // For demo, we'll simulate the private key export
    // In real implementation, this would be the actual private key
    const simulatedPrivateKey = new Uint8Array(32);
    crypto.getRandomValues(simulatedPrivateKey);
    setPrivateKeyRaw(simulatedPrivateKey);

    // Step 5: XOR encryption
    setCurrentStep(4);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const encrypted = xorEncrypt(simulatedPrivateKey, derivedKey);
    setEncryptedPrivateKey(encrypted);

    setIsProcessing(false);
  };

  useEffect(() => {
    executeEncryption();
  }, []);

  const formatBytes = (bytes: Uint8Array, length: number = 16): string => {
    return Array.from(bytes.slice(0, length))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ') + (bytes.length > length ? '...' : '');
  };

  const handleContinue = () => {
    navigate('/cloud-pms');
  };

  return (
    <div className="fade-in">
      <div className="card genuine-mode">
        <h2>🔐 Encryption Engine</h2>
        
        <div className="alert alert-info">
          <h4>Step 3: CASPER Encryption Process</h4>
          <p>
            Demonstrating the exact CASPER encryption: <strong>s̃ = u ⊕ s</strong> where 
            u = HKDF(w*, z) and s is the private signing key.
          </p>
        </div>

        <div className="card" style={{ background: '#f8f9fa' }}>
          <h4>🔄 Encryption Steps Progress</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            {steps.map((step, index) => (
              <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                <div 
                  className={`step-circle ${
                    index < currentStep ? 'completed' : 
                    index === currentStep ? 'active' : ''
                  }`}
                  style={{ margin: '0 auto 8px' }}
                >
                  {index + 1}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {isProcessing && (
          <div className="animation-container">
            <div className="spinning" style={{ fontSize: '48px', marginBottom: '20px' }}>
              ⚙️
            </div>
            <h3>Executing CASPER Encryption...</h3>
            <p>Step {currentStep + 1}: {steps[currentStep]}</p>
          </div>
        )}

        {!isProcessing && encryptedPrivateKey && (
          <div className="fade-in">
            <div className="alert alert-success">
              <h4>✅ Encryption Complete</h4>
              <p>Private key successfully encrypted using CASPER algorithm</p>
            </div>

            <div className="grid">
              <div className="card">
                <h4>🔑 Real Secret (w*)</h4>
                <p>Selected using PIN: <code>{appState.userPin}</code></p>
                {realSecret && (
                  <div className="crypto-display genuine-mode">
                    {formatBytes(realSecret)}
                  </div>
                )}
              </div>

              <div className="card">
                <h4>🧂 Salt (z)</h4>
                <p>Random 256-bit salt for HKDF</p>
                {salt && (
                  <div className="crypto-display">
                    {formatBytes(salt)}
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
              <h4>🔬 HKDF Key Derivation</h4>
              <p><strong>Formula:</strong> u = HKDF(w*, z)</p>
              <p>Derives encryption key from real secret and salt</p>
              
              {encryptionKey && (
                <div>
                  <strong>Derived Key (u):</strong>
                  <div className="crypto-display" style={{ background: '#ffeaa7' }}>
                    {formatBytes(encryptionKey)}
                  </div>
                </div>
              )}
            </div>

            <div className="grid">
              <div className="card">
                <h4>🔐 Private Key (s)</h4>
                <p>ECDSA P-256 private signing key</p>
                {privateKeyRaw && (
                  <div className="crypto-display">
                    {formatBytes(privateKeyRaw)}
                  </div>
                )}
              </div>

              <div className="card">
                <h4>🔒 Encrypted Key (s̃)</h4>
                <p><strong>s̃ = u ⊕ s</strong></p>
                {encryptedPrivateKey && (
                  <div className="crypto-display attacker-mode">
                    {formatBytes(encryptedPrivateKey)}
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ background: '#e8f5e8', border: '1px solid #4CAF50' }}>
              <h4>🛡️ XOR Encryption Properties</h4>
              <div className="grid">
                <div>
                  <h5>✅ Security Benefits</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Perfect secrecy with correct key</li>
                    <li>Symmetric operation (encrypt = decrypt)</li>
                    <li>No additional padding required</li>
                    <li>Computationally efficient</li>
                  </ul>
                </div>
                <div>
                  <h5>🔐 CASPER Integration</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Key derived from real secret only</li>
                    <li>Wrong secret → wrong key → garbage</li>
                    <li>Forces attacker to use decoy keys</li>
                    <li>Enables breach detection</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="alert alert-warning">
              <h4>🚨 Critical Security Note</h4>
              <p>
                The encrypted private key (s̃) will be stored in the cloud PMS. Without the correct 
                PIN to select w*, an attacker cannot derive the proper encryption key (u) and 
                therefore cannot decrypt the real private key (s).
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                Continue to Cloud PMS View →
              </button>
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px', background: '#f0f8ff' }}>
          <h4>📊 Encryption Algorithm Analysis</h4>
          <div className="grid">
            <div>
              <h5>Input Requirements</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Real secret w* (from PIN selection)</li>
                <li>Random salt z (256 bits)</li>
                <li>Private key s (ECDSA P-256)</li>
              </ul>
            </div>
            <div>
              <h5>Output Products</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Encryption key u (HKDF derived)</li>
                <li>Encrypted key s̃ (XOR result)</li>
                <li>Cloud-safe storage format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionEngine;