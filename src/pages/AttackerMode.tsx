import React, { useState } from 'react'
import { AppState } from '../App'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const AttackerMode: React.FC<Props> = ({ appState, setAppState, navigate }) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<any>(null);
  const [challenge, setChallenge] = useState<Uint8Array | null>(null);
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [cloudDataAccess, setCloudDataAccess] = useState(false);

  const generateChallenge = (): Uint8Array => {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    return challenge;
  };

  const formatBytes = (bytes: Uint8Array, length: number = 16): string => {
    return Array.from(bytes.slice(0, length))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ') + (bytes.length > length ? '...' : '');
  };

  const simulateCloudBreach = () => {
    setCloudDataAccess(true);
  };

  const executeAttack = async () => {
    if (!cloudDataAccess) {
      alert('Attacker must first gain access to cloud data');
      return;
    }

    setIsAttacking(true);
    setAttackResult(null);
    setVerificationResult(null);

    try {
      // Step 1: Generate challenge (same as genuine user)
      const authChallenge = generateChallenge();
      setChallenge(authChallenge);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Attacker attempts login without PIN
      const result = await appState.casperAuth.attackerLogin(authChallenge);
      setSignature(result.signature);
      setPublicKey(result.publicKey);
      setAttackResult(result);

      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Verify signature and detect breach
      const verification = await appState.casperAuth.verifyAndDetectBreach(
        result.signature,
        result.publicKey,
        authChallenge
      );
      setVerificationResult(verification);

      // Update app state if breach detected
      if (verification.isBreach) {
        setAppState(prev => ({ ...prev, breachDetected: true }));
      }

    } catch (error) {
      console.error('Attack simulation failed:', error);
      setAttackResult({ error: error.message });
    }

    setIsAttacking(false);
  };

  const handleContinue = () => {
    if (verificationResult && verificationResult.isBreach) {
      navigate('/breach');
    } else {
      navigate('/complete');
    }
  };

  const cloudData = appState.casperAuth.getCloudData();

  return (
    <div className="fade-in">
      <div className="card attacker-mode">
        <h2>🚨 Attacker Mode Simulation</h2>
        
        <div className="alert alert-danger">
          <h4>Step 8: Cloud Data Compromise Scenario</h4>
          <p>
            Simulate an attacker who has gained access to all cloud PMS data but 
            does not know the user's PIN. This demonstrates CASPER's breach detection capability.
          </p>
        </div>

        <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
          <h4>🎭 Attacker Profile</h4>
          <div className="grid">
            <div>
              <h5>✅ What Attacker Has</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Complete cloud PMS data</li>
                <li>All detection secrets (W)</li>
                <li>Encrypted private key (s̃)</li>
                <li>Salt value (z)</li>
                <li>Knowledge of CASPER algorithm</li>
              </ul>
            </div>
            <div>
              <h5>❌ What Attacker Lacks</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>User's PIN (η)</li>
                <li>Knowledge of real secret (w*)</li>
                <li>Correct encryption key (u)</li>
                <li>Real private key (s)</li>
                <li>Ability to avoid detection</li>
              </ul>
            </div>
          </div>
        </div>

        {!cloudDataAccess && (
          <div className="card" style={{ background: '#f8d7da', border: '1px solid #f44336' }}>
            <h4>🔓 Step 1: Gain Cloud Access</h4>
            <p>
              First, the attacker must compromise the cloud PMS to access stored data.
              In a real scenario, this could happen through various attack vectors.
            </p>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                className="btn btn-danger"
                onClick={simulateCloudBreach}
              >
                🚨 Simulate Cloud PMS Breach
              </button>
            </div>
          </div>
        )}

        {cloudDataAccess && cloudData && (
          <div className="fade-in">
            <div className="alert alert-warning">
              <h4>⚠️ Cloud Data Compromised</h4>
              <p>Attacker now has access to all cloud PMS data</p>
            </div>

            <div className="card" style={{ background: '#f8f9fa' }}>
              <h4>📊 Compromised Data Analysis</h4>
              
              <div className="grid">
                <div className="card">
                  <h5>🔒 Encrypted Private Key</h5>
                  <div className="crypto-display">
                    {formatBytes(cloudData.encryptedPrivateKey, 20)}
                  </div>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Attacker sees this but cannot decrypt without correct key
                  </p>
                </div>

                <div className="card">
                  <h5>🔐 Detection Secrets</h5>
                  <div style={{ fontSize: '14px' }}>
                    {cloudData.detectionSecrets.map((secret, index) => (
                      <div key={index} className="crypto-display" style={{ marginBottom: '4px' }}>
                        w{index + 1}: {formatBytes(secret, 8)}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Attacker cannot identify which is the real secret (w*)
                  </p>
                </div>
              </div>
            </div>

            {!attackResult && (
              <div className="card" style={{ background: '#f8d7da', border: '1px solid #f44336' }}>
                <h4>⚔️ Step 2: Execute Attack</h4>
                <p>
                  Attacker attempts authentication by randomly selecting detection secrets 
                  and trying to decrypt the private key. Without the PIN, they cannot 
                  identify the real secret.
                </p>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button 
                    className="btn btn-danger"
                    onClick={executeAttack}
                    disabled={isAttacking}
                  >
                    {isAttacking ? 'Executing Attack...' : '🎯 Execute CASPER Attack'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isAttacking && (
          <div className="animation-container">
            <div className="spinning" style={{ fontSize: '48px', marginBottom: '20px' }}>
              ⚔️
            </div>
            <h3>Executing Attack Simulation...</h3>
            <p>Attacker randomly selecting detection secrets</p>
          </div>
        )}

        {attackResult && !attackResult.error && (
          <div className="fade-in">
            <div className="alert alert-warning">
              <h4>⚠️ Attack Executed</h4>
              <p>Attacker completed authentication attempt using compromised data</p>
            </div>

            <div className="card" style={{ background: '#f8d7da' }}>
              <h4>🎯 Attack Flow Analysis</h4>
              
              <div className="grid">
                <div className="card">
                  <h5>1️⃣ Challenge Response</h5>
                  <p>Attacker responds to same challenge as genuine user</p>
                  {challenge && (
                    <div className="crypto-display">
                      <strong>Challenge:</strong><br/>
                      {formatBytes(challenge, 20)}
                    </div>
                  )}
                </div>

                <div className="card">
                  <h5>2️⃣ Random Secret Selection</h5>
                  <p>Without PIN, attacker randomly selects from W</p>
                  <div className="crypto-display attacker-mode">
                    <strong>Selection:</strong> Random w_i (not w*)
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="card">
                  <h5>3️⃣ Wrong Key Derivation</h5>
                  <p>HKDF with wrong secret produces wrong encryption key</p>
                  <div className="crypto-display">
                    <strong>Process:</strong><br/>
                    u_wrong = HKDF(w_wrong, z)<br/>
                    garbage = u_wrong ⊕ s̃
                  </div>
                </div>

                <div className="card">
                  <h5>4️⃣ Decoy Key Usage</h5>
                  <p>Failed decryption forces use of decoy private key</p>
                  {signature && (
                    <div className="crypto-display attacker-mode">
                      <strong>Signature:</strong><br/>
                      {formatBytes(signature, 20)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {verificationResult && (
              <div className="card" style={{ 
                background: verificationResult.isBreach ? '#f8d7da' : '#e8f5e8',
                border: `2px solid ${verificationResult.isBreach ? '#f44336' : '#4CAF50'}`
              }}>
                <h4>🔍 Breach Detection Results</h4>
                
                <div className="grid">
                  <div>
                    <h5>Signature Verification</h5>
                    <p>
                      <span className={`status-indicator ${
                        verificationResult.isValid ? 'status-genuine' : 'status-attacker'
                      }`}></span>
                      <strong>Valid:</strong> {verificationResult.isValid ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  <div>
                    <h5>User Authentication</h5>
                    <p>
                      <span className={`status-indicator ${
                        verificationResult.isGenuine ? 'status-genuine' : 'status-attacker'
                      }`}></span>
                      <strong>Genuine User:</strong> {verificationResult.isGenuine ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  <div>
                    <h5>Breach Detection</h5>
                    <p>
                      <span className={`status-indicator ${
                        verificationResult.isBreach ? 'status-attacker' : 'status-genuine'
                      }`}></span>
                      <strong>Breach Detected:</strong> {verificationResult.isBreach ? 'YES!' : 'No'}
                    </p>
                  </div>
                </div>

                {verificationResult.isBreach && (
                  <div className="breach-alert">
                    <h3>🚨 CASPER BREACH DETECTED! 🚨</h3>
                    <p>
                      Public key verified against trap key set (V'). This signature 
                      came from a decoy key, indicating unauthorized access to cloud data.
                    </p>
                    <p><strong>IMMEDIATE ACTION REQUIRED</strong></p>
                  </div>
                )}

                {!verificationResult.isBreach && verificationResult.isValid && (
                  <div className="alert alert-danger">
                    <h5>⚠️ Unexpected Result</h5>
                    <p>
                      Attack should have triggered breach detection. This may indicate 
                      an implementation issue or the attacker got lucky with secret selection.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="card" style={{ background: '#e8f4fd' }}>
              <h4>🔬 CASPER Detection Mechanism</h4>
              
              <div className="grid">
                <div>
                  <h5>Why Detection Works</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Attacker cannot identify w* without PIN</li>
                    <li>Random selection has low success probability</li>
                    <li>Wrong secret → wrong encryption key</li>
                    <li>Wrong key → garbage decryption</li>
                    <li>Forced to use decoy keys</li>
                    <li>Decoy keys verify against V' → breach!</li>
                  </ul>
                </div>
                
                <div>
                  <h5>Detection Probability</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Success probability: 1/k (k = 5)</li>
                    <li>Detection probability: (k-1)/k = 80%</li>
                    <li>Multiple attempts increase detection</li>
                    <li>Even successful attacks leave traces</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                {verificationResult && verificationResult.isBreach ? 
                  'View Breach Alert →' : 
                  'Continue to Completion →'
                }
              </button>
            </div>
          </div>
        )}

        {attackResult && attackResult.error && (
          <div className="alert alert-danger">
            <h4>❌ Attack Simulation Failed</h4>
            <p>{attackResult.error}</p>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px', background: '#f0f8ff' }}>
          <h4>🎯 Attack Scenario Significance</h4>
          <p>
            This simulation demonstrates CASPER's core innovation: <strong>active breach detection</strong>. 
            Unlike traditional systems that fail silently when compromised, CASPER actively 
            signals when unauthorized access occurs, even when the attack produces valid signatures.
          </p>
          
          <div className="alert alert-info" style={{ marginTop: '15px' }}>
            <strong>Key Insight:</strong> The attacker's signature is cryptographically valid 
            but behaviorally suspicious. CASPER detects this through the trap key mechanism, 
            proving that the cloud data was compromised.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackerMode;