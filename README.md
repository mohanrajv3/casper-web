# CASPER-Based Web Authenticator

## 🔐 Research-Grade Implementation

This is a complete implementation of the CASPER (Cryptographic Authentication with Secret Protection and Enhanced Recovery) algorithm for academic review and security evaluation. The system demonstrates real cryptographic operations, breach detection, and authenticator functionality.

## 🎯 Project Goals

- **Complete CASPER Implementation**: Exact algorithm specification with no shortcuts
- **Real Cryptographic Operations**: ECDSA signatures, HKDF key derivation, XOR encryption
- **Working Breach Detection**: Actual detection of cloud data compromise
- **Functional Authenticator**: Password & passkey vault with CASPER-based security
- **Academic Compliance**: Suitable for faculty review and security evaluation

## 🔬 CASPER Algorithm Features

### Core Components
- **Detection Secrets (W)**: k ≥ 5 cryptographically random secrets
- **PIN-Based Selection**: Deterministic secret selection using user PIN
- **HKDF Key Derivation**: u = HKDF(w*, z) for encryption key generation
- **XOR Encryption**: s̃ = u ⊕ s (exactly as specified)
- **Trap Keys**: Decoy public keys in V' for breach detection

### Security Properties
- **PIN Privacy**: PIN never leaves browser, never stored in cloud
- **Breach Detection**: Automatic detection when cloud data is compromised
- **Zero False Positives**: Genuine users never trigger breach alerts
- **High Detection Rate**: (k-1)/k probability of detecting attacks

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 🌐 System Flow

1. **Landing Page**: CASPER-based authenticator explanation
2. **Authenticator Setup**: Username & PIN creation
3. **Vault Initialization**: Detection secrets generation
4. **Encryption Engine**: HKDF + XOR encryption demonstration
5. **Cloud PMS View**: See exactly what gets uploaded
6. **Password & Passkey Vault**: Secure credential storage
7. **RP Registration**: Real vs trap key separation
8. **Normal Login**: Genuine user authentication
9. **Attacker Mode**: Simulate cloud data compromise
10. **Breach Detection**: Automatic threat detection
11. **Algorithm Completion**: Implementation proof

## 🔐 Technical Architecture

### Cryptographic Operations
- **Key Generation**: ECDSA P-256 key pairs
- **Key Derivation**: HKDF-SHA256 with salt
- **Encryption**: XOR with derived keys
- **Signatures**: ECDSA-SHA256 digital signatures
- **Verification**: Public key signature verification

### Security Model
- **Genuine User Path**: PIN → w* → correct key → real signature → V verification
- **Attacker Path**: No PIN → random secret → wrong key → decoy signature → V' detection

### Storage Architecture
- **Cloud PMS**: Encrypted private key (s̃), detection secrets (W), salt (z)
- **Relying Party**: Real public keys (V), trap public keys (V')
- **Local Vault**: AES-256-GCM encrypted credentials

## 🛡️ Security Guarantees

### What CASPER Protects Against
- Cloud PMS compromise
- Credential database breaches
- Silent authentication failures
- Undetected unauthorized access

### What Attackers Cannot Do
- Identify real secret without PIN
- Decrypt private key without w*
- Avoid detection when using wrong secrets
- Access vault without correct PIN

## 📊 Implementation Status

- ✅ PIN-based Secret Selection: COMPLETE
- ✅ Detection Secret Generation: COMPLETE  
- ✅ HKDF Key Derivation: COMPLETE
- ✅ XOR Encryption: COMPLETE
- ✅ Trap Key Generation: COMPLETE
- ✅ Breach Detection: COMPLETE
- ✅ Vault Integration: COMPLETE

## ⚠️ Research Implementation Notice

This is a **CASPER-inspired architecture** for research and academic evaluation. It implements the complete algorithm with real cryptography but is not FIDO-certified or production-ready.

### Suitable For
- Academic review and evaluation
- Security research and analysis
- Algorithm demonstration and testing
- Educational purposes

### Not Suitable For
- Production deployment
- Commercial applications
- FIDO-compliant systems
- Mission-critical authentication

## 🎓 Academic Significance

This implementation demonstrates:
- **Active vs Passive Security**: Proactive breach detection
- **Behavioral Cryptography**: Usage pattern analysis for security
- **Decoy-Based Mechanisms**: Trap keys for attack detection
- **PIN-Protected Cloud Storage**: Low-entropy secret leverage
- **Zero-Knowledge Architecture**: Minimal information exposure

## 📋 Mandatory Statement

**"The CASPER algorithm is fully implemented and operational in this web authenticator. Native mobile authenticator deployment is a packaging extension, not an algorithmic dependency."**

## 🔬 Research Contributions

- Transforms authentication from binary (success/failure) to three-state (success/failure/detected-compromise)
- Demonstrates practical breach detection in authentication systems
- Shows how low-entropy secrets (PINs) can protect high-entropy data
- Proves feasibility of decoy-based security mechanisms
- Establishes behavioral analysis as a security primitive

## 📄 License

This research implementation is provided for academic and educational purposes. See LICENSE file for details.

## 🤝 Contributing

This is a research implementation. For academic collaboration or security analysis, please open an issue or contact the maintainers.

---

**Built with**: React, TypeScript, Web Crypto API, Vite
**Algorithm**: CASPER (Cryptographic Authentication with Secret Protection and Enhanced Recovery)
**Purpose**: Academic research and security evaluation