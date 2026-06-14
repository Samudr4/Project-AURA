import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { projectId, filename, mimeType, content } = req.body;

    if (!projectId || !filename || content === undefined) {
      return res.status(422).json({ success: false, error: 'projectId, filename, and content are required' });
    }

    const uniqueName = `${Date.now()}-${filename}`;
    const storagePath = path.join(UPLOADS_DIR, uniqueName);

    // Save file content to disk
    fs.writeFileSync(storagePath, content, 'utf8');
    const fileSize = Buffer.byteLength(content, 'utf8');

    // Create Document record
    const document = await prisma.document.create({
      data: {
        projectId,
        filename,
        mimeType: mimeType || 'text/plain',
        fileSize: BigInt(fileSize),
        storagePath: uniqueName, // Save file key relative to uploads folder
        status: 'indexed'
      }
    });

    // Mock Chunking process (slice by 1000 characters)
    const chunkSize = 1000;
    const chunksCount = Math.max(1, Math.ceil(content.length / chunkSize));
    
    for (let i = 0; i < chunksCount; i++) {
      const start = i * chunkSize;
      const slice = content.substring(start, start + chunkSize);
      
      await prisma.documentChunk.create({
        data: {
          documentId: document.id,
          chunkIndex: i,
          chunkSize: slice.length
        }
      });
    }

    // Convert BigInt to string for JSON output
    const documentResponse = {
      ...document,
      fileSize: document.fileSize.toString()
    };

    res.status(201).json({ success: true, data: documentResponse });
  } catch (error: any) {
    logger.error({ msg: 'Upload document failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const listDocuments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(422).json({ success: false, error: 'projectId is required' });
    }

    const documents = await prisma.document.findMany({
      where: { projectId: projectId as string },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = documents.map(doc => ({
      ...doc,
      fileSize: doc.fileSize.toString()
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    logger.error({ msg: 'List documents failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getDocumentChunks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({
      where: { id }
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const dbChunks = await prisma.documentChunk.findMany({
      where: { documentId: id },
      orderBy: { chunkIndex: 'asc' }
    });

    // Read full file content to populate chunk text
    const filePath = path.join(UPLOADS_DIR, doc.storagePath);
    let fullText = '';
    if (fs.existsSync(filePath)) {
      fullText = fs.readFileSync(filePath, 'utf8');
    }

    const chunkSize = 1000;
    const chunks = dbChunks.map((chunk) => {
      const start = chunk.chunkIndex * chunkSize;
      const content = fullText.substring(start, start + chunkSize) || '[empty chunk]';
      return {
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        chunkSize: chunk.chunkSize,
        content: content,
        createdAt: chunk.createdAt
      };
    });

    res.status(200).json({ success: true, data: chunks });
  } catch (error: any) {
    logger.error({ msg: 'Get document chunks failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({
      where: { id }
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Try deleting the local file on disk
    const filePath = path.join(UPLOADS_DIR, doc.storagePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err: any) {
        logger.warn(`Failed to delete file from disk: ${filePath}. Error: ${err.message}`);
      }
    }

    // Delete record from DB (Cascading deletes chunks)
    await prisma.document.delete({
      where: { id }
    });

    res.status(200).json({ success: true, data: { id } });
  } catch (error: any) {
    logger.error({ msg: 'Delete document failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
