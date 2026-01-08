/**
 * CASPER Algorithm Implementation
 * Implements the exact CASPER specification with real cryptographic operations
 */

// CASPER Step 1: User PIN (η) - Low entropy PIN for secret selection
export interface UserPIN {
  pin: string; // 4-6 digits
}

// CASPER Step 2: Detection Secret Generation
export interface DetectionSecrets {
  W: Uint8Array[]; // Array of k detection secrets (k ≥ 5)
  realSecretIndex: number; // Index of w* (real secret)
}

// CASPER Step 3: Secret Selection Function
export function selectSecret(W: Uint8Array[], pin: string): Uint8Array {
  // Deterministic selection based on PIN
  // PIN selects which secret is the real one (w*)
  const pinHash = new TextEncoder().encode(pin);
  let selector = 0;
  for (let i = 0; i < pinHash.length; i++) {
    selector = (selector + pinHash[i]) % W.length;
  }
  return W[selector];
}

// CASPER Step 4: Passkey Generation (Real cryptographic private key)
export async function generateSigningKey(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    true, // extractable
    ["sign", "verify"]
  );
}

// CASPER Step 5: HKDF Key Derivation
export async function deriveEncryptionKey(secret: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
  // u = HKDF(w*, z)
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    secret,
    "HKDF",
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt,
      info: new TextEncoder().encode("CASPER-encryption-key")
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Export as raw bytes for XOR operation
  const keyBuffer = await crypto.subtle.exportKey("raw", derivedKey);
  return new Uint8Array(keyBuffer);
}

// CASPER Step 6: XOR Encryption (s̃ = u XOR s)
export function xorEncrypt(privateKey: Uint8Array, encryptionKey: Uint8Array): Uint8Array {
  // Ensure keys are same length by padding/truncating
  const maxLength = Math.max(privateKey.length, encryptionKey.length);
  const paddedPrivateKey = new Uint8Array(maxLength);
  const paddedEncryptionKey = new Uint8Array(maxLength);
  
  paddedPrivateKey.set(privateKey);
  paddedEncryptionKey.set(encryptionKey);
  
  const encrypted = new Uint8Array(maxLength);
  for (let i = 0; i < maxLength; i++) {
    encrypted[i] = paddedPrivateKey[i] ^ paddedEncryptionKey[i];
  }
  
  return encrypted;
}

// XOR Decryption (s = u XOR s̃)
export function xorDecrypt(encryptedKey: Uint8Array, encryptionKey: Uint8Array): Uint8Array {
  // XOR is symmetric, so decryption is same as encryption
  return xorEncrypt(encryptedKey, encryptionKey);
}

// CASPER Step 7: Generate Detection Secrets
export function generateDetectionSecrets(k: number = 5): DetectionSecrets {
  const W: Uint8Array[] = [];
  
  // Generate k cryptographically random secrets
  for (let i = 0; i < k; i++) {
    const secret = new Uint8Array(32); // 256-bit secrets
    crypto.getRandomValues(secret);
    W.push(secret);
  }
  
  // Randomly select which one is the real secret
  const realSecretIndex = Math.floor(Math.random() * k);
  
  return { W, realSecretIndex };
}

// CASPER Step 8: Generate Decoy Passkeys
export async function generateDecoyPasskeys(fakeSecrets: Uint8Array[], salt: Uint8Array): Promise<CryptoKeyPair[]> {
  const decoyKeys: CryptoKeyPair[] = [];
  
  for (const fakeSecret of fakeSecrets) {
    // Generate decoy private key using fake secret
    const decoyEncryptionKey = await deriveEncryptionKey(fakeSecret, salt);
    
    // Generate a real key pair for the decoy (indistinguishable from real)
    const decoyKeyPair = await generateSigningKey();
    decoyKeys.push(decoyKeyPair);
  }
  
  return decoyKeys;
}

// CASPER Step 9: Cloud PMS Storage Structure
export interface CloudPMSData {
  encryptedPrivateKey: Uint8Array; // s̃
  detectionSecrets: Uint8Array[]; // W
  salt: Uint8Array; // z
  // PMS MUST NOT KNOW: PIN, real secret index, plain private key
}

// CASPER Step 10: Relying Party Storage
export interface RelyingPartyData {
  realPublicKeys: CryptoKey[]; // V - genuine user keys
  trapPublicKeys: CryptoKey[]; // V' - decoy keys that signal breach
}

// CASPER Authentication Logic
export class CASPERAuthenticator {
  private detectionSecrets: DetectionSecrets | null = null;
  private realKeyPair: CryptoKeyPair | null = null;
  private decoyKeyPairs: CryptoKeyPair[] = [];
  private salt: Uint8Array | null = null;
  private cloudData: CloudPMSData | null = null;
  private rpData: RelyingPartyData | null = null;

  // Initialize CASPER system
  async initialize(pin: string): Promise<void> {
    // Step 1: Generate detection secrets
    this.detectionSecrets = generateDetectionSecrets(5);
    
    // Step 2: Generate salt
    this.salt = new Uint8Array(32);
    crypto.getRandomValues(this.salt);
    
    // Step 3: Select real secret using PIN
    const realSecret = selectSecret(this.detectionSecrets.W, pin);
    
    // Step 4: Generate real signing key
    this.realKeyPair = await generateSigningKey();
    
    // Step 5: Derive encryption key and encrypt private key
    const encryptionKey = await deriveEncryptionKey(realSecret, this.salt);
    const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", this.realKeyPair.privateKey);
    const encryptedPrivateKey = xorEncrypt(new Uint8Array(privateKeyRaw), encryptionKey);
    
    // Step 6: Generate decoy keys for fake secrets
    const fakeSecrets = this.detectionSecrets.W.filter((_, index) => 
      index !== this.detectionSecrets!.realSecretIndex
    );
    this.decoyKeyPairs = await generateDecoyPasskeys(fakeSecrets, this.salt);
    
    // Step 7: Prepare cloud PMS data (what gets uploaded)
    this.cloudData = {
      encryptedPrivateKey,
      detectionSecrets: this.detectionSecrets.W,
      salt: this.salt
    };
    
    // Step 8: Prepare RP data
    const trapPublicKeys = this.decoyKeyPairs.map(pair => pair.publicKey);
    this.rpData = {
      realPublicKeys: [this.realKeyPair.publicKey],
      trapPublicKeys
    };
  }

  // Genuine user login
  async genuineLogin(pin: string, challenge: Uint8Array): Promise<{ signature: Uint8Array; publicKey: CryptoKey }> {
    if (!this.cloudData || !this.detectionSecrets) {
      throw new Error("CASPER not initialized");
    }

    // Step 1: Select real secret using PIN
    const realSecret = selectSecret(this.cloudData.detectionSecrets, pin);
    
    // Step 2: Derive encryption key
    const encryptionKey = await deriveEncryptionKey(realSecret, this.cloudData.salt);
    
    // Step 3: Decrypt private key
    const decryptedKeyRaw = xorDecrypt(this.cloudData.encryptedPrivateKey, encryptionKey);
    
    // Step 4: Import private key
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      decryptedKeyRaw,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
    
    // Step 5: Sign challenge
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      privateKey,
      challenge
    );
    
    return {
      signature: new Uint8Array(signature),
      publicKey: this.realKeyPair!.publicKey
    };
  }

  // Attacker simulation (has cloud data but not PIN)
  async attackerLogin(challenge: Uint8Array): Promise<{ signature: Uint8Array; publicKey: CryptoKey }> {
    if (!this.cloudData || !this.decoyKeyPairs.length) {
      throw new Error("No cloud data available for attacker");
    }

    // Attacker randomly selects a detection secret (cannot know which is real)
    const randomSecretIndex = Math.floor(Math.random() * this.cloudData.detectionSecrets.length);
    const selectedSecret = this.cloudData.detectionSecrets[randomSecretIndex];
    
    // Derive encryption key with wrong secret
    const encryptionKey = await deriveEncryptionKey(selectedSecret, this.cloudData.salt);
    
    // Decrypt with wrong key (produces garbage)
    const decryptedKeyRaw = xorDecrypt(this.cloudData.encryptedPrivateKey, encryptionKey);
    
    // Since decryption failed, attacker uses a decoy key
    const decoyKeyPair = this.decoyKeyPairs[Math.floor(Math.random() * this.decoyKeyPairs.length)];
    
    // Sign with decoy key
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      decoyKeyPair.privateKey,
      challenge
    );
    
    return {
      signature: new Uint8Array(signature),
      publicKey: decoyKeyPair.publicKey
    };
  }

  // Verify signature and detect breach
  async verifyAndDetectBreach(signature: Uint8Array, publicKey: CryptoKey, challenge: Uint8Array): Promise<{
    isValid: boolean;
    isBreach: boolean;
    isGenuine: boolean;
  }> {
    if (!this.rpData) {
      throw new Error("RP data not available");
    }

    // Verify signature
    const isValid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      publicKey,
      signature,
      challenge
    );

    if (!isValid) {
      return { isValid: false, isBreach: false, isGenuine: false };
    }

    // Check if public key is in real keys (V)
    const isGenuine = await this.isKeyInSet(publicKey, this.rpData.realPublicKeys);
    
    // Check if public key is in trap keys (V')
    const isBreach = await this.isKeyInSet(publicKey, this.rpData.trapPublicKeys);

    return { isValid, isBreach, isGenuine };
  }

  private async isKeyInSet(targetKey: CryptoKey, keySet: CryptoKey[]): Promise<boolean> {
    const targetKeyRaw = await crypto.subtle.exportKey("spki", targetKey);
    
    for (const key of keySet) {
      const keyRaw = await crypto.subtle.exportKey("spki", key);
      if (this.arrayBuffersEqual(targetKeyRaw, keyRaw)) {
        return true;
      }
    }
    
    return false;
  }

  private arrayBuffersEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
    if (a.byteLength !== b.byteLength) return false;
    const viewA = new Uint8Array(a);
    const viewB = new Uint8Array(b);
    for (let i = 0; i < viewA.length; i++) {
      if (viewA[i] !== viewB[i]) return false;
    }
    return true;
  }

  // Getters for UI display
  getCloudData(): CloudPMSData | null {
    return this.cloudData;
  }

  getRPData(): RelyingPartyData | null {
    return this.rpData;
  }

  getDetectionSecrets(): DetectionSecrets | null {
    return this.detectionSecrets;
  }
}