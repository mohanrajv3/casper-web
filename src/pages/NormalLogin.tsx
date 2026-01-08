import React, { useState } from 'react'
import { AppState } from '../App'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const NormalLogin: React.FC<Props> = ({ appState, navigate }) => {
  const [pin, setPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginResult, setLoginResult] = useState<any>(null);
  const [challenge, setChallenge] = useState<Uint8Array | null>(null);
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginResult(null);
    setVerificationResult(null);

    try {
      // Step 1: Generate challenge
      const authChallenge = generateChallenge();
      setChallenge(authChallenge);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Perform genuine user login
      const result = await appState.casperAuth.genuineLogin(pin, authChallenge);
      setSignature(result.signature);
      setPublicKey(result.publicKey);
      setLoginResult(result);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Verify signature and check for breach
      const verification = await appState.casperAuth.verifyAndDetectBreach(
        result.signature,
        result.publicKey,
        authChallenge
      );
      setVerificationResult(verification);

    } catch (error) {
      console.error('Login failed:', error);
      setLoginResult({ error: error.message });
    }

    setIsLoggingIn(false);
  };

  const handleContinue = () => {
    navigate('/attacker');
  };

  return (
    <div className="fade-in">
      <div className="card genuine-mode">
        <h2>🔐 Normal Login (Genuine User)</h2>
        
        <div className="alert alert-info">
          <h4>Step 7: Genuine User Authentication</h4>
          <p>
            Demonstrate the complete CASPER authentication flow for a genuine user 
            with the correct PIN. This shows real cryptographic signing and verification.
          </p>
        </div>

        {!loginResult && (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="pin">Enter Your PIN</label>
              <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                maxLength={6}
                disabled={isLoggingIn}
              />
              <small style={{ color: '#666', fontSize: '14px' }}>
                Use the same PIN you created during setup
              </small>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoggingIn || pin.length < 4}
              >
                {isLoggingIn ? 'Authenticating...' : 'Authenticate'}
              </button>
            </div>
          </form>
        )}

        {isLoggingIn && (
          <div className="animation-container">
            <div className="spinning" style={{ fontSize: '48px', marginBottom: '20px' }}>
              🔐
            </div>
            <h3>Executing CASPER Authentication...</h3>
            <p>Performing real cryptographic operations</p>
          </div>
        )}

        {loginResult && !loginResult.error && (
          <div className="fade-in">
            <div className="alert alert-success">
              <h4>✅ Authentication Successful</h4>
              <p>Genuine user successfully authenticated using CASPER algorithm</p>
            </div>

            <div className="card" style={{ background: '#e8f5e8' }}>
              <h4>🔄 Authentication Flow</h4>
              
              <div className="grid">
                <div className="card">
                  <h5>1️⃣ Challenge Generation</h5>
                  <p>Random 256-bit challenge created by RP</p>
                  {challenge && (
                    <div className="crypto-display">
                      <strong>Challenge:</strong><br/>
                      {formatBytes(challenge, 20)}
                    </div>
                  )}
                </div>

                <div className="card">
                  <h5>2️⃣ PIN-Based Secret Selection</h5>
                  <p>PIN selects real secret (w*) from detection set</p>
                  <div className="crypto-display genuine-mode">
                    <strong>PIN:</strong> {pin} → w* selected
                  </div>
                </div>
              </div>

              <div className="grid">
                <div className="card">
                  <h5>3️⃣ Key Decryption</h5>
                  <p>HKDF derives encryption key, XOR decrypts private key</p>
                  <div className="crypto-display">
                    <strong>Process:</strong><br/>
                    u = HKDF(w*, z)<br/>
                    s = u ⊕ s̃
                  </div>
                </div>

                <div className="card">
                  <h5>4️⃣ Digital Signature</h5>
                  <p>ECDSA signature generated with real private key</p>
                  {signature && (
                    <div className="crypto-display genuine-mode">
                      <strong>Signature:</strong><br/>
                      {formatBytes(signature, 20)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {verificationResult && (
              <div className="card" style={{ 
                background: verificationResult.isGenuine ? '#e8f5e8' : '#f8d7da',
                border: `2px solid ${verificationResult.isGenuine ? '#4CAF50' : '#f44336'}`
              }}>
                <h4>🔍 Verification Results</h4>
                
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
                      <strong>Breach Detected:</strong> {verificationResult.isBreach ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                {verificationResult.isGenuine && !verificationResult.isBreach && (
                  <div className="alert alert-success" style={{ marginTop: '15px' }}>
                    <h5>🎉 Login Successful</h5>
                    <p>
                      Public key verified against real key set (V). User authenticated successfully.
                      No breach detected - this is a genuine authentication.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="card" style={{ background: '#f0f8ff' }}>
              <h4>🔬 CASPER Algorithm Analysis</h4>
              
              <div className="grid">
                <div>
                  <h5>✅ Genuine User Advantages</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Knows correct PIN</li>
                    <li>Selects real secret deterministically</li>
                    <li>Derives correct encryption key</li>
                    <li>Decrypts real private key</li>
                    <li>Signs with genuine key</li>
                    <li>Verifies against V (real key set)</li>
                  </ul>
                </div>
                
                <div>
                  <h5>🔐 Security Properties</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>PIN never transmitted</li>
                    <li>Real secret never exposed</li>
                    <li>Private key stays encrypted in cloud</li>
                    <li>Signature proves key possession</li>
                    <li>No breach detection triggered</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                Continue to Attacker Mode →
              </button>
            </div>
          </div>
        )}

        {loginResult && loginResult.error && (
          <div className="alert alert-danger">
            <h4>❌ Authentication Failed</h4>
            <p>{loginResult.error}</p>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setLoginResult(null);
                setPin('');
              }}
            >
              Try Again
            </button>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
          <h4>🎯 What This Demonstrates</h4>
          <p>
            This genuine user login proves that CASPER works exactly as specified:
          </p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li><strong>Real Cryptography:</strong> Actual ECDSA signatures, not simulated</li>
            <li><strong>PIN Security:</strong> PIN enables correct secret selection</li>
            <li><strong>Key Derivation:</strong> HKDF produces correct encryption key</li>
            <li><strong>XOR Decryption:</strong> Real private key successfully recovered</li>
            <li><strong>Signature Verification:</strong> Public key matches real key set (V)</li>
          </ul>
          
          <div className="alert alert-info" style={{ marginTop: '15px' }}>
            <strong>Next:</strong> We'll demonstrate what happens when an attacker 
            tries to authenticate without the PIN, showing how CASPER detects the breach.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NormalLogin;