import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';


const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

async function processFile(file: File, type: string, projectId: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  
  const ext = path.extname(file.name);
  const uniqueFilename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, uniqueFilename);
  
  await fs.writeFile(filePath, buffer);

  return prisma.document.create({
    data: {
      projectId,
      type,
      filename: file.name,
      fileHash: hash,
      // We will store the internal physical path in fileHash or a separate field? 
      // Actually, we don't have a path field in the schema, let's just append it to the hash field or add it?
      // Wait, let's keep the schema simple and use `id` to lookup the file later. We can just save it as `${id}.pdf`.
      // Since we don't have the ID yet, we save it with a UUID, and maybe rename it later, but wait, we need to read it later.
      // Let's modify the schema slightly or just store it in a known location by `fileHash`. 
      // Yes, saving as `${hash}.pdf` is deterministic and allows deduplication!
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    await ensureUploadsDir();

    const formData = await req.formData();
    const guideline = formData.get('guideline') as File;
    const application = formData.get('application') as File;
    const supporting = formData.getAll('supporting') as File[];

    if (!guideline || !application) {
      return NextResponse.json({ error: 'Guideline and Application are required' }, { status: 400 });
    }

    const projectName = `Review - ${new Date().toLocaleString()}`;

    // Create project
    const project = await prisma.project.create({
      data: { name: projectName }
    });

    // We'll save files using their hash as the filename to make retrieval easy and deterministic
    const saveFileWithHash = async (file: File, type: string) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      const filePath = path.join(UPLOADS_DIR, `${hash}.pdf`);
      
      // Save only if it doesn't exist
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, buffer);
      }

      return prisma.document.create({
        data: {
          projectId: project.id,
          type,
          filename: file.name,
          fileHash: hash,
        },
      });
    };

    await saveFileWithHash(guideline, 'GUIDELINE');
    await saveFileWithHash(application, 'DRAFT_APPLICATION');
    
    for (const doc of supporting) {
      await saveFileWithHash(doc, 'SUPPORTING');
    }

    return NextResponse.json({ projectId: project.id, success: true });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
