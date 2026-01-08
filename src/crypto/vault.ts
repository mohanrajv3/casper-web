/**
 * CASPER-based Password & Passkey Vault
 * Vault encryption tied to CASPER detection secrets
 */

export interface VaultEntry {
  id: string;
  type: 'password' | 'passkey';
  website: string;
  username: string;
  data: string; // encrypted password or passkey data
  createdAt: Date;
  lastUsed?: Date;
}

export interface PasskeyData {
  credentialId: string;
  privateKey: string; // encrypted
  publicKey: string;
  rpId: string;
  userHandle: string;
}

export class CASPERVault {
  private entries: VaultEntry[] = [];
  private vaultKey: Uint8Array | null = null;

  // Initialize vault with CASPER-derived key
  async initializeVault(realSecret: Uint8Array, salt: Uint8Array): Promise<void> {
    // Derive vault encryption key from CASPER real secret
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      realSecret,
      "HKDF",
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: salt,
        info: new TextEncoder().encode("CASPER-vault-key")
      },
      keyMaterial,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );

    this.vaultKey = new Uint8Array(await crypto.subtle.exportKey("raw", derivedKey));
  }

  // Encrypt data for vault storage
  private async encryptData(data: string): Promise<string> {
    if (!this.vaultKey) {
      throw new Error("Vault not initialized");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      this.vaultKey,
      "AES-GCM",
      false,
      ["encrypt"]
    );

    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data from vault
  private async decryptData(encryptedData: string): Promise<string> {
    if (!this.vaultKey) {
      throw new Error("Vault not initialized");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      this.vaultKey,
      "AES-GCM",
      false,
      ["decrypt"]
    );

    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  }

  // Add password entry
  async addPassword(website: string, username: string, password: string): Promise<string> {
    const encryptedPassword = await this.encryptData(password);
    
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      type: 'password',
      website,
      username,
      data: encryptedPassword,
      createdAt: new Date()
    };

    this.entries.push(entry);
    return entry.id;
  }

  // Add passkey entry
  async addPasskey(website: string, username: string, passkeyData: PasskeyData): Promise<string> {
    const encryptedData = await this.encryptData(JSON.stringify(passkeyData));
    
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      type: 'passkey',
      website,
      username,
      data: encryptedData,
      createdAt: new Date()
    };

    this.entries.push(entry);
    return entry.id;
  }

  // Get password
  async getPassword(id: string): Promise<string | null> {
    const entry = this.entries.find(e => e.id === id && e.type === 'password');
    if (!entry) return null;

    entry.lastUsed = new Date();
    return await this.decryptData(entry.data);
  }

  // Get passkey
  async getPasskey(id: string): Promise<PasskeyData | null> {
    const entry = this.entries.find(e => e.id === id && e.type === 'passkey');
    if (!entry) return null;

    entry.lastUsed = new Date();
    const decryptedData = await this.decryptData(entry.data);
    return JSON.parse(decryptedData);
  }

  // List all entries (without decrypting data)
  getEntries(): Omit<VaultEntry, 'data'>[] {
    return this.entries.map(({ data, ...entry }) => entry);
  }

  // Search entries
  searchEntries(query: string): Omit<VaultEntry, 'data'>[] {
    const lowercaseQuery = query.toLowerCase();
    return this.entries
      .filter(entry => 
        entry.website.toLowerCase().includes(lowercaseQuery) ||
        entry.username.toLowerCase().includes(lowercaseQuery)
      )
      .map(({ data, ...entry }) => entry);
  }

  // Delete entry
  deleteEntry(id: string): boolean {
    const index = this.entries.findIndex(e => e.id === id);
    if (index === -1) return false;
    
    this.entries.splice(index, 1);
    return true;
  }

  // Generate secure password
  generatePassword(length: number = 16, includeSymbols: boolean = true): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = lowercase + uppercase + numbers;
    if (includeSymbols) {
      charset += symbols;
    }

    let password = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }

  // Export vault data (encrypted)
  exportVault(): string {
    return JSON.stringify({
      entries: this.entries,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    });
  }

  // Import vault data
  importVault(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.entries && Array.isArray(parsed.entries)) {
        this.entries = parsed.entries;
      }
    } catch (error) {
      throw new Error('Invalid vault data format');
    }
  }

  // Get vault statistics
  getStats(): {
    totalEntries: number;
    passwordCount: number;
    passkeyCount: number;
    recentlyUsed: number;
  } {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalEntries: this.entries.length,
      passwordCount: this.entries.filter(e => e.type === 'password').length,
      passkeyCount: this.entries.filter(e => e.type === 'passkey').length,
      recentlyUsed: this.entries.filter(e => e.lastUsed && e.lastUsed > weekAgo).length
    };
  }
}