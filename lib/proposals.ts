// lib/proposals.ts
import { supabase } from './supabase'
import { getOrCreateClient } from './clients'
import crypto from 'crypto'

export async function saveProposal(proposalData, encodedData) {
  // First get or create the client
  const client = await getOrCreateClient({
    clientName: proposalData.clientName,
    companyName: proposalData.companyName
  })
  
  // Save the proposal
  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert({
      client_id: client.id,
      title: `Proposal for ${client.company_name}`,
      proposal_date: proposalData.proposalDate,
      additional_info: proposalData.additionalInfo || null,
      proposal_data: proposalData,
      encoded_data: encodedData
    })
    .select()
    .single()
    
  if (error) throw error
  
  // Create a link token
  const token = crypto.randomUUID()
  
  const { error: linkError } = await supabase
    .from('proposal_links')
    .insert({
      proposal_id: proposal.id,
      token
    })
    
  if (linkError) throw linkError
  
  // Get base URL with priority order
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  
  return {
    ...proposal,
    link: `${baseUrl}/proposal?token=${token}`
  }
}

export async function getProposalByToken(token) {
  // Find the proposal link
  const { data: link, error: linkError } = await supabase
    .from('proposal_links')
    .select('proposal_id')
    .eq('token', token)
    .single()
    
  if (linkError) return null
  
  // Get the proposal
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('id', link.proposal_id)
    .single()
    
  if (proposalError) return null
  
  return proposal
}
