import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const insforge = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mappingId, oldStatus, newStatus, reason } = await req.json();

    if (!mappingId || !newStatus) {
      return NextResponse.json({ error: 'Mapping ID and new status are required' }, { status: 400 });
    }

    const { data: actionRecord, error } = await insforge.database
      .from('review_actions')
      .insert([{
        mapping_id: mappingId,
        user_id: user.id,
        old_status: oldStatus || 'missing',
        new_status: newStatus,
        reason: reason || '',
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting review action:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: actionRecord });
  } catch (err: any) {
    console.error('Review action server error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
