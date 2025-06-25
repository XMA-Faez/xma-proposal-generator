import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (you can add your own auth check here)
    // For example, check for a secret token in headers
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the database function to expire proposals
    const { data, error } = await supabase.rpc('check_and_expire_proposals');

    if (error) {
      console.error('Error expiring proposals:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get count of expired proposals for logging
    const { data: expiredCount, error: countError } = await supabase
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'expired')
      .gte('updated_at', new Date(Date.now() - 60000).toISOString()); // Updated in last minute

    const count = countError ? 0 : expiredCount;

    return NextResponse.json({ 
      success: true, 
      message: `Proposal expiration check completed`,
      expiredCount: count
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}