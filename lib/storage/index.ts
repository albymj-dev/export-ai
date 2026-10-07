import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface StorageFile {
  buffer: Buffer;
  mimeType: string;
  size: number;
  originalName: string;
}

export interface StoredFileMeta {
  storageKey: string;
  relativePath: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface StorageService {
  saveDocument(
    userId: string,
    shipmentId: string,
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<StoredFileMeta>;
  
  getDocument(storageKey: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
  
  deleteDocument(storageKey: string): Promise<boolean>;
  
  saveReport(
    shipmentId: string,
    reportName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<StoredFileMeta>;
  
  getReport(storageKey: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
}

export class LocalStorageService implements StorageService {
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.resolve(process.cwd(), '.storage');
    this.ensureDirs();
  }

  private async ensureDirs() {
    try {
      await fs.mkdir(path.join(this.baseDir, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'previews'), { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'processed'), { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'reports'), { recursive: true });
    } catch {
      // Directories already exist or will be created on demand
    }
  }

  private sanitizeFilename(name: string): string {
    const clean = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    return clean.replace(/\.{2,}/g, '.');
  }

  private validateSafePath(targetPath: string): boolean {
    const resolved = path.resolve(targetPath);
    return resolved.startsWith(this.baseDir);
  }

  async saveDocument(
    userId: string,
    shipmentId: string,
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<StoredFileMeta> {
    await this.ensureDirs();

    const safeUserId = this.sanitizeFilename(userId);
    const safeShipmentId = this.sanitizeFilename(shipmentId);
    const safeOriginal = this.sanitizeFilename(fileName);

    const ext = path.extname(safeOriginal) || '.bin';
    const uniqueId = crypto.randomUUID();
    const storedFileName = `${uniqueId}${ext}`;

    const targetDir = path.join(this.baseDir, 'documents', safeUserId, safeShipmentId);
    if (!this.validateSafePath(targetDir)) {
      throw new Error('Invalid storage path');
    }

    await fs.mkdir(targetDir, { recursive: true });
    const fullPath = path.join(targetDir, storedFileName);

    await fs.writeFile(fullPath, buffer);

    const relativePath = path.relative(this.baseDir, fullPath);
    const storageKey = `documents/${safeUserId}/${safeShipmentId}/${storedFileName}`;

    return {
      storageKey,
      relativePath,
      size: buffer.length,
      mimeType,
      createdAt: new Date().toISOString(),
    };
  }

  async getDocument(storageKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const cleanKey = storageKey.replace(/\.\./g, '');
    const fullPath = path.join(this.baseDir, cleanKey);

    if (!this.validateSafePath(fullPath)) {
      throw new Error('Access denied: invalid storage path');
    }

    try {
      const buffer = await fs.readFile(fullPath);
      const ext = path.extname(cleanKey).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.json') mimeType = 'application/json';

      return { buffer, mimeType };
    } catch {
      return null;
    }
  }

  async deleteDocument(storageKey: string): Promise<boolean> {
    const cleanKey = storageKey.replace(/\.\./g, '');
    const fullPath = path.join(this.baseDir, cleanKey);
    if (!this.validateSafePath(fullPath)) return false;

    try {
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async saveReport(
    shipmentId: string,
    reportName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<StoredFileMeta> {
    await this.ensureDirs();
    const safeShipmentId = this.sanitizeFilename(shipmentId);
    const safeReportName = this.sanitizeFilename(reportName);
    const targetDir = path.join(this.baseDir, 'reports', safeShipmentId);
    
    if (!this.validateSafePath(targetDir)) {
      throw new Error('Invalid storage path');
    }

    await fs.mkdir(targetDir, { recursive: true });
    const fullPath = path.join(targetDir, safeReportName);
    await fs.writeFile(fullPath, buffer);

    const storageKey = `reports/${safeShipmentId}/${safeReportName}`;
    return {
      storageKey,
      relativePath: path.relative(this.baseDir, fullPath),
      size: buffer.length,
      mimeType,
      createdAt: new Date().toISOString(),
    };
  }

  async getReport(storageKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    return this.getDocument(storageKey);
  }
}

// Global storage singleton instance
export const storage: StorageService = new LocalStorageService();
