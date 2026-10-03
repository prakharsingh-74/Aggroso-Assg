import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const insforge = createServerClient({ cookies: cookieStore });

    // Enforce authentication
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve all document records of the project to get their file hashes
    const { data: docs } = await insforge.database
      .from('documents')
      .select('file_hash')
      .eq('project_id', id);

    // Delete project from storage
    const { error: deleteDbError } = await insforge.database
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteDbError) {
      console.error('Error deleting project from database:', deleteDbError);
      return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
    }

    // Delete all object files from Storage bucket
    if (docs && docs.length > 0) {
      const objectKeys = docs
        .map((d: any) => d.file_hash)
        .filter(Boolean)
        .map((hash: string) => `${hash}.pdf`);

      if (objectKeys.length > 0) {
        const { error: storageError } = await insforge.storage
          .from('documents')
          .remove(objectKeys);

        if (storageError) {
          console.error('Error deleting PDF files from InsForge storage:', storageError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete project server error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await req.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Document name is required' }, { status: 400 });
    }

    const sanitizedName = name.trim().slice(0, 200);

    const cookieStore = await cookies();
    const insforge = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: project, error } = await insforge.database
      .from('projects')
      .update({ name: sanitizedName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error('Update project server error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
