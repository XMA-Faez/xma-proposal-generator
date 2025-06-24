// File: app/api/update-proposal-status/route.ts

import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return Response.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      );
    }
    
    const { id, status } = body;
    
    if (!id) {
      return Response.json(
        { error: 'Proposal ID is required' }, 
        { status: 400 }
      );
    }
    
    if (!status) {
      return Response.json(
        { error: 'Status is required' }, 
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'paid', 'expired'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return Response.json(
        { error: 'Invalid status value' }, 
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Update the proposal status
    const { error } = await supabase
      .from('proposals')
      .update({ status: status.toLowerCase() })
      .eq('id', id);
      
    if (error) {
      console.error('Database error when updating proposal status:', error);
      return Response.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    
    return Response.json({ 
      success: true,
      message: `Proposal status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}
