import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams.token;
    
    if (!token) {
      return Response.json(
        { error: 'Token is required' }, 
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Find the proposal link
    const { data: link, error: linkError } = await supabase
      .from('proposal_links')
      .select('proposal_id, views_count')
      .eq('token', token)
      .single();
      
    if (linkError) {
      return Response.json(
        { error: 'Invalid proposal link' }, 
        { status: 404 }
      );
    }
    
    // Get the proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', link.proposal_id)
      .single();
      
    if (proposalError) {
      return Response.json(
        { error: 'Proposal not found' }, 
        { status: 404 }
      );
    }
    
    // Update view count
    await supabase
      .from('proposal_links')
      .update({ views_count: (link.views_count || 0) + 1 })
      .eq('token', token);
    
    return Response.json({ proposal });
  } catch (error) {
    console.error('Error retrieving proposal:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}
