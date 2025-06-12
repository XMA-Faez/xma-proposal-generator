// lib/orderIdGenerator.ts

/**
 * Generates a structured order ID for proposals
 * Format: XMA-YYYY-MM-NNNNN
 * Where:
 * - XMA is the company prefix
 * - YYYY is the current year
 * - MM is the current month
 * - NNNNN is a sequential number (padded with zeros)
 *
 * @param {number} sequentialNumber - A sequential number to ensure uniqueness
 * @returns {string} The formatted order ID
 */
export function generateOrderId(sequentialNumber: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  
  // Ensure sequentialNumber is a valid number
  const validSequence = typeof sequentialNumber === 'number' && !isNaN(sequentialNumber) 
    ? sequentialNumber 
    : 1;
  
  const sequence = String(validSequence).padStart(5, "0");

  return `XMA-${year}-${month}-${sequence}`;
}

/**
 * Gets the next sequential number for order IDs
 * In a production environment, this would typically be handled by a database sequence
 * or transaction to ensure uniqueness
 *
 * @param supabase - The Supabase client
 * @returns {Promise<number>} The next sequential number
 */
export async function getNextSequentialNumber(supabase: any): Promise<number> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
  const monthStr = String(currentMonth).padStart(2, "0");

  // Get the highest current sequential number for the current year and month
  const { data, error } = await supabase
    .from("proposals")
    .select("order_id")
    .not("order_id", "is", null)
    .filter("order_id", "like", `XMA-${currentYear}-${monthStr}-%`)
    .order("order_id", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching last order ID:", error);
    // Start from 1 if there's an error
    return 1;
  }

  if (!data || data.length === 0) {
    // No existing order IDs for this month/year, start from 1
    return 1;
  }

  try {
    // Extract the sequential part from the last order ID
    const lastOrderId = data[0].order_id;
    const sequentialPart = lastOrderId.split("-").pop();

    if (sequentialPart && !isNaN(parseInt(sequentialPart))) {
      // Increment the sequence number
      return parseInt(sequentialPart) + 1;
    }
  } catch (err) {
    console.error("Error parsing last order ID:", err);
  }

  // Fallback to 1 if we can't parse the last order ID
  return 1;
}
