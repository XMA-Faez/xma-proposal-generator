// lib/clients.ts
import { supabase } from './supabase'

export async function createClient(clientData) {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: clientData.clientName,
      company_name: clientData.companyName,
      email: clientData.email || null,
      phone: clientData.phone || null
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function getOrCreateClient(clientData) {
  // Check if client exists by company name
  const { data: existingClient } = await supabase
    .from('clients')
    .select()
    .eq('company_name', clientData.companyName)
    .single()
    
  if (existingClient) return existingClient
  
  // Create new client if not found
  return createClient(clientData)
}
