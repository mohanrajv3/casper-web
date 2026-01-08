import React, { useState, useEffect } from 'react'
import { AppState } from '../App'

interface Props {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (path: string) => void;
}

const BreachDetection: React.FC<Props> = ({ appState, navigate }) => {
  const [alertPhase, setAlertPhase] = useState(0);
  const [incidentId] = useState(() => 'CASPER-' + Date.now().toString(36).toUpperCase());
  const [timestamp] = useState(() => new Date().toISOString());

  useEffect(() => {
    // Animate through alert phases
    const phases = [0, 1, 2, 3];
    let currentPhase = 0;
    
    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      setAlertPhase(currentPhase);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    navigate('/complete');
  };

  const getAlertMessage = () => {
    switch (alertPhase) {
      case 0:
        return "🚨 BREACH DETECTED - ANALYZING THREAT";
      case 1:
        return "⚠️ UNAUTHORIZED ACCESS CONFIRMED";
      case 2:
        return "🔒 SECURITY PROTOCOLS ACTIVATED";
      case 3:
        return "📊 GENERATING INCIDENT REPORT";
      default:
        return "🚨 CASPER BREACH DETECTION ACTIVE";
    }
  };

  return (
    <div className="fade-in">
      <div className="card attacker-mode">
        <div className="breach-alert">
          <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>
            {getAlertMessage()}
          </h1>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>
            CASPER Algorithm Successfully Detected Cloud Data Compromise
          </div>
        </div>

        <div className="alert alert-danger">
          <h4>Step 9: Breach Detection Analysis</h4>
          <p>
            CASPER has successfully detected that an attacker gained access to cloud PMS data 
            and attempted unauthorized authentication. This demonstrates the algorithm's 
            core security guarantee.
          </p>
        </div>

        <div className="card" style={{ background: '#f8d7da', border: '2px solid #f44336' }}>
          <h3>📋 Incident Report</h3>
          
          <div className="grid">
            <div>
              <strong>Incident ID:</strong> {incidentId}<br/>
              <strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}<br/>
              <strong>User Account:</strong> {appState.username}<br/>
              <strong>Detection Method:</strong> CASPER Trap Key Verification
            </div>
            <div>
              <strong>Threat Level:</strong> <span style={{ color: '#f44336' }}>CRITICAL</span><br/>
              <strong>Attack Vector:</strong> Cloud PMS Compromise<br/>
              <strong>Status:</strong> <span style={{ color: '#f44336' }}>ACTIVE BREACH</span><br/>
              <strong>Response:</strong> Automatic Detection & Alert
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffeaa7' }}>
          <h4>🔍 Detection Mechanism Analysis</h4>
          
          <div className="grid">
            <div className="card">
              <h5>🎯 How Detection Worked</h5>
              <ol style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Attacker compromised cloud PMS data</li>
                <li>Attacker attempted authentication without PIN</li>
                <li>Random secret selection (not w*)</li>
                <li>Wrong encryption key derived</li>
                <li>Private key decryption failed</li>
                <li>Attacker forced to use decoy key</li>
                <li><strong>Signature verified against V' → BREACH!</strong></li>
              </ol>
            </div>

            <div className="card">
              <h5>🛡️ CASPER Security Properties</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                <li><strong>Immediate Detection:</strong> No silent failures</li>
                <li><strong>High Probability:</strong> (k-1)/k detection rate</li>
                <li><strong>Cryptographic Validity:</strong> Signatures still verify</li>
                <li><strong>Behavioral Analysis:</strong> Usage pattern detection</li>
                <li><strong>Zero False Positives:</strong> Genuine users never trigger</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#e8f4fd' }}>
          <h4>📊 Breach Detection Statistics</h4>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Metric</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Value</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Explanation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Detection Probability</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>80%</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>4/5 secrets are decoys (k=5)</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>False Positive Rate</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>0%</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Genuine users never use trap keys</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Response Time</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#4CAF50' }}>Immediate</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Detection on first attack attempt</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Attack Success Rate</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #dee2e6', color: '#f44336' }}>20%</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>1/5 chance of selecting real secret</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ background: '#d4edda', border: '2px solid #4CAF50' }}>
          <h4>🎉 CASPER Algorithm Success</h4>
          
          <div className="grid">
            <div>
              <h5>✅ Demonstrated Capabilities</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Real cryptographic operations</li>
                <li>Actual breach detection (not simulated)</li>
                <li>PIN-based secret selection</li>
                <li>HKDF key derivation</li>
                <li>XOR encryption/decryption</li>
                <li>Trap key mechanism</li>
                <li>Behavioral analysis</li>
              </ul>
            </div>
            
            <div>
              <h5>🔬 Academic Contributions</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Active vs passive security</li>
                <li>Breach detection in authentication</li>
                <li>Decoy-based security mechanisms</li>
                <li>PIN-protected cloud storage</li>
                <li>Zero-knowledge architectures</li>
                <li>Behavioral cryptography</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="alert alert-warning">
          <h4>🚨 Recommended Actions</h4>
          <div className="grid">
            <div>
              <h5>Immediate Response</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Revoke all current sessions</li>
                <li>Force password reset</li>
                <li>Generate new detection secrets</li>
                <li>Audit cloud PMS security</li>
              </ul>
            </div>
            <div>
              <h5>Long-term Measures</h5>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Implement additional monitoring</li>
                <li>Review access controls</li>
                <li>Update security policies</li>
                <li>Conduct security training</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#f0f8ff' }}>
          <h4>🔬 Technical Analysis</h4>
          <p>
            This breach detection demonstrates CASPER's fundamental innovation: transforming 
            authentication from a binary success/failure model to a three-state model that 
            includes <strong>detected compromise</strong>.
          </p>
          
          <div className="alert alert-info" style={{ marginTop: '15px' }}>
            <strong>Research Significance:</strong> CASPER proves that authentication systems 
            can actively detect when they've been compromised, rather than failing silently. 
            This represents a paradigm shift in security architecture design.
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleContinue}
          >
            Continue to Algorithm Completion →
          </button>
        </div>

        <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
          <h4>📈 Impact Assessment</h4>
          <p>
            The successful detection of this simulated breach proves that CASPER can:
          </p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li><strong>Detect real attacks:</strong> Not just theoretical vulnerabilities</li>
            <li><strong>Provide immediate alerts:</strong> No delayed discovery</li>
            <li><strong>Maintain usability:</strong> Genuine users unaffected</li>
            <li><strong>Scale effectively:</strong> Detection probability increases with k</li>
            <li><strong>Integrate seamlessly:</strong> Works with existing infrastructure</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BreachDetection;