import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { CASPERAuthenticator } from './crypto/casper'
import { CASPERVault } from './crypto/vault'

// Import all page components
import LandingPage from './pages/LandingPage'
import AuthenticatorSetup from './pages/AuthenticatorSetup'
import VaultInitialization from './pages/VaultInitialization'
import EncryptionEngine from './pages/EncryptionEngine'
import CloudPMSView from './pages/CloudPMSView'
import VaultDashboard from './pages/VaultDashboard'
import RPRegistration from './pages/RPRegistration'
import NormalLogin from './pages/NormalLogin'
import AttackerMode from './pages/AttackerMode'
import BreachDetection from './pages/BreachDetection'
import AlgorithmCompletion from './pages/AlgorithmCompletion'

// Global state interface
export interface AppState {
  casperAuth: CASPERAuthenticator;
  vault: CASPERVault;
  userPin: string;
  username: string;
  isAttackerMode: boolean;
  currentStep: number;
  breachDetected: boolean;
}

// Progress steps
const STEPS = [
  { id: 1, label: 'Landing', path: '/' },
  { id: 2, label: 'Setup', path: '/setup' },
  { id: 3, label: 'Vault Init', path: '/vault-init' },
  { id: 4, label: 'Encryption', path: '/encryption' },
  { id: 5, label: 'Cloud PMS', path: '/cloud-pms' },
  { id: 6, label: 'Vault', path: '/vault' },
  { id: 7, label: 'RP Registration', path: '/rp-registration' },
  { id: 8, label: 'Login', path: '/login' },
  { id: 9, label: 'Attacker', path: '/attacker' },
  { id: 10, label: 'Breach', path: '/breach' },
  { id: 11, label: 'Complete', path: '/complete' }
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize global state
  const [appState, setAppState] = useState<AppState>({
    casperAuth: new CASPERAuthenticator(),
    vault: new CASPERVault(),
    userPin: '',
    username: '',
    isAttackerMode: false,
    currentStep: 1,
    breachDetected: false
  });

  // Update current step based on route
  useEffect(() => {
    const currentStep = STEPS.find(step => step.path === location.pathname);
    if (currentStep) {
      setAppState(prev => ({ ...prev, currentStep: currentStep.id }));
    }
  }, [location.pathname]);

  // Progress bar component
  const ProgressBar = () => (
    <div className="progress-bar">
      {STEPS.map((step) => (
        <div 
          key={step.id} 
          className={`progress-step ${step.id <= appState.currentStep ? 'active' : ''}`}
        >
          <div className={`step-circle ${
            step.id < appState.currentStep ? 'completed' : 
            step.id === appState.currentStep ? 'active' : ''
          }`}>
            {step.id}
          </div>
          <div className="step-label">{step.label}</div>
        </div>
      ))}
    </div>
  );

  // Mode toggle component
  const ModeToggle = () => (
    <div className="mode-toggle">
      <button
        className={`btn ${appState.isAttackerMode ? 'btn-danger' : 'btn-primary'}`}
        onClick={() => setAppState(prev => ({ 
          ...prev, 
          isAttackerMode: !prev.isAttackerMode 
        }))}
      >
        <span className={`status-indicator ${
          appState.isAttackerMode ? 'status-attacker' : 'status-genuine'
        }`}></span>
        {appState.isAttackerMode ? 'Attacker Mode' : 'Genuine User Mode'}
      </button>
    </div>
  );

  return (
    <div className="App">
      <ModeToggle />
      
      <div className="container">
        <ProgressBar />
        
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/setup" 
            element={<AuthenticatorSetup appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/vault-init" 
            element={<VaultInitialization appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/encryption" 
            element={<EncryptionEngine appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/cloud-pms" 
            element={<CloudPMSView appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/vault" 
            element={<VaultDashboard appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/rp-registration" 
            element={<RPRegistration appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/login" 
            element={<NormalLogin appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/attacker" 
            element={<AttackerMode appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/breach" 
            element={<BreachDetection appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
          <Route 
            path="/complete" 
            element={<AlgorithmCompletion appState={appState} setAppState={setAppState} navigate={navigate} />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;