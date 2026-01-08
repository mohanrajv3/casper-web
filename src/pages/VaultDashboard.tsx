import React, { useState, useEffect } from 'react'
import { AppState } from '../App'
import { selectSecret } from '../crypto/casper'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const VaultDashboard: React.FC<Props> = ({ appState, navigate }) => {
  const [isVaultInitialized, setIsVaultInitialized] = useState(false);
  const [newPassword, setNewPassword] = useState({
    website: '',
    username: '',
    password: ''
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [vaultEntries, setVaultEntries] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    initializeVault();
  }, []);

  const initializeVault = async () => {
    try {
      // Get real secret using PIN
      const secrets = appState.casperAuth.getDetectionSecrets();
      const cloudData = appState.casperAuth.getCloudData();
      
      if (secrets && cloudData) {
        const realSecret = selectSecret(secrets.W, appState.userPin);
        await appState.vault.initializeVault(realSecret, cloudData.salt);
        setIsVaultInitialized(true);
        
        // Add some demo entries
        await addDemoEntries();
      }
    } catch (error) {
      console.error('Failed to initialize vault:', error);
    }
  };

  const addDemoEntries = async () => {
    // Add demo password entries
    await appState.vault.addPassword('github.com', appState.username, 'demo-password-123');
    await appState.vault.addPassword('google.com', appState.username + '@gmail.com', 'secure-pass-456');
    
    // Add demo passkey entry
    const demoPasskey = {
      credentialId: 'demo-credential-id-789',
      privateKey: 'encrypted-private-key-data',
      publicKey: 'demo-public-key-data',
      rpId: 'example.com',
      userHandle: appState.username
    };
    
    await appState.vault.addPasskey('example.com', appState.username, demoPasskey);
    
    // Update entries display
    setVaultEntries(appState.vault.getEntries());
  };

  const generateSecurePassword = () => {
    const password = appState.vault.generatePassword(16, true);
    setGeneratedPassword(password);
    setNewPassword(prev => ({ ...prev, password }));
  };

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.website || !newPassword.username || !newPassword.password) {
      return;
    }

    await appState.vault.addPassword(
      newPassword.website,
      newPassword.username,
      newPassword.password
    );

    setVaultEntries(appState.vault.getEntries());
    setNewPassword({ website: '', username: '', password: '' });
    setGeneratedPassword('');
    setShowAddForm(false);
  };

  const handleContinue = () => {
    navigate('/rp-registration');
  };

  const stats = appState.vault.getStats();

  return (
    <div className="fade-in">
      <div className="card genuine-mode">
        <h2>🔐 CASPER Vault Dashboard</h2>
        
        <div className="alert alert-info">
          <h4>Step 5: Password & Passkey Vault</h4>
          <p>
            Your vault is encrypted using the CASPER real secret (w*). Only someone with 
            your PIN can decrypt and access your stored credentials.
          </p>
        </div>

        {isVaultInitialized ? (
          <div className="fade-in">
            <div className="alert alert-success">
              <h4>✅ Vault Initialized</h4>
              <p>Vault encryption key derived from CASPER real secret</p>
            </div>

            <div className="grid">
              <div className="card" style={{ background: '#e8f5e8' }}>
                <h4>📊 Vault Statistics</h4>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                      {stats.totalEntries}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Entries</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                      {stats.passwordCount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Passwords</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                      {stats.passkeyCount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Passkeys</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4>🔐 Vault Security</h4>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                  <li>AES-256-GCM encryption</li>
                  <li>Key derived from CASPER w*</li>
                  <li>PIN-protected access</li>
                  <li>Zero-knowledge architecture</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4>🗂️ Stored Credentials</h4>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? 'Cancel' : '+ Add Password'}
                </button>
              </div>

              {showAddForm && (
                <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
                  <h5>Add New Password</h5>
                  <form onSubmit={handleAddPassword}>
                    <div className="grid">
                      <div className="input-group">
                        <label>Website</label>
                        <input
                          type="text"
                          value={newPassword.website}
                          onChange={(e) => setNewPassword(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="example.com"
                        />
                      </div>
                      <div className="input-group">
                        <label>Username</label>
                        <input
                          type="text"
                          value={newPassword.username}
                          onChange={(e) => setNewPassword(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="your-username"
                        />
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <label>Password</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="password"
                          value={newPassword.password}
                          onChange={(e) => setNewPassword(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter or generate password"
                          style={{ flex: 1 }}
                        />
                        <button 
                          type="button"
                          className="btn btn-warning"
                          onClick={generateSecurePassword}
                        >
                          Generate
                        </button>
                      </div>
                      {generatedPassword && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                          Generated: <code>{generatedPassword}</code>
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" className="btn btn-primary">
                      Add to Vault
                    </button>
                  </form>
                </div>
              )}

              <div>
                {vaultEntries.map((entry) => (
                  <div key={entry.id} className="vault-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4>
                          {entry.type === 'password' ? '🔑' : '🔐'} {entry.website}
                        </h4>
                        <p><strong>Username:</strong> {entry.username}</p>
                        <p><strong>Type:</strong> {entry.type}</p>
                        <p><strong>Created:</strong> {new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className={`status-indicator ${
                          entry.type === 'password' ? 'status-genuine' : 'status-pms'
                        }`}></span>
                        {entry.type === 'password' ? 'Password' : 'Passkey'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
              <h4>🔐 Vault Encryption Details</h4>
              <div className="grid">
                <div>
                  <h5>Encryption Process</h5>
                  <ol style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Real secret w* selected using PIN</li>
                    <li>Vault key derived: HKDF(w*, salt)</li>
                    <li>Each entry encrypted with AES-256-GCM</li>
                    <li>Unique IV per encryption operation</li>
                  </ol>
                </div>
                <div>
                  <h5>Security Properties</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                    <li>PIN required for vault access</li>
                    <li>Wrong PIN → wrong key → no decryption</li>
                    <li>Authenticated encryption prevents tampering</li>
                    <li>Forward secrecy with key rotation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleContinue}
              >
                Continue to RP Registration →
              </button>
            </div>
          </div>
        ) : (
          <div className="animation-container">
            <div className="spinning" style={{ fontSize: '48px', marginBottom: '20px' }}>
              🔐
            </div>
            <h3>Initializing CASPER Vault...</h3>
            <p>Deriving encryption key from real secret</p>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px', background: '#f0f8ff' }}>
          <h4>🛡️ Vault Security Architecture</h4>
          <p>
            The CASPER vault demonstrates how the detection secret system extends beyond 
            just authentication to secure credential storage. Your vault is only accessible 
            with the correct PIN, making it resistant to cloud breaches.
          </p>
          
          <div className="alert alert-info" style={{ marginTop: '15px' }}>
            <strong>Key Insight:</strong> Even if an attacker compromises the cloud PMS and 
            obtains all detection secrets, they cannot decrypt your vault without knowing 
            which secret is real (w*), which requires your PIN.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultDashboard;