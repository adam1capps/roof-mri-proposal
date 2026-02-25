/**
 * Google Sheets API Integration for Roof MRI Warranty App
 * Connects to the Apps Script Web App deployed from the 
 * Coating_Warranty_Comparison_Matrix spreadsheet.
 * 
 * GET: Reads Warranty_Terms, Manufacturers, Products, Pricing_Submissions
 * POST: Writes new pricing submissions to the Pricing_Submissions tab
 */

const SHEETS_API_URL = 'https://script.google.com/a/macros/re-dry.com/s/AKfycbxwSNA1s9Zq6SUC7AGzS82KBswwIWOQp4BfKvA8cPyygZPHethAdvY5sMOuOkTAnf0a/exec';

/**
 * Fetch all data from the Google Sheet
 * @param {string} action - 'all', 'warranty_terms', 'manufacturers', 'products', 'pricing'
 * @returns {Promise<Object>} Sheet data as JSON
 */
export const fetchSheetData = async (action = 'all') => {
  try {
    const url = `${SHEETS_API_URL}?action=${action}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Unknown error');
    return data;
  } catch (err) {
    console.error('[SheetsAPI] Fetch error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Submit a new pricing entry to the Google Sheet
 * @param {Object} submission - Pricing submission data
 * @returns {Promise<Object>} Result with submission_id
 */
export const submitPricingToSheet = async (submission) => {
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manufacturer: submission.manufacturer,
        product: submission.product,
        warranty_term: submission.warrantyTerm,
        region_state: submission.regionState,
        sq_ft_cost: submission.sqFtCost,
        total_project_cost: submission.totalProjectCost,
        project_size_sqft: submission.projectSizeSqft,
        submitted_by: submission.submittedBy || 'App User',
        notes: submission.notes || ''
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[SheetsAPI] Submit error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Convert sheet pricing rows into the app's pricingStore format
 * Groups by warranty term key (manufacturer + product + term)
 * @param {Array} pricingRows - Raw rows from Pricing_Submissions sheet
 * @returns {Object} pricingStore-compatible object keyed by warrantyId
 */
export const convertSheetPricingToStore = (pricingRows) => {
  const store = {};
  if (!pricingRows || !Array.isArray(pricingRows)) return store;
  
  pricingRows.forEach(row => {
    // Create a key that can match WARRANTY_DB entries
    const key = `${row.Manufacturer}|${row.Product}|${row.Warranty_Term}`.toLowerCase();
    
    if (!store[key]) {
      store[key] = {
        manufacturer: row.Manufacturer,
        product: row.Product,
        warrantyTerm: row.Warranty_Term,
        submissions: []
      };
    }
    
    store[key].submissions.push({
      id: row.Submission_ID,
      date: row.Date,
      regionState: row.Region_State,
      sqFtCost: parseFloat(row.Sq_Ft_Cost) || 0,
      totalProjectCost: parseFloat(row.Total_Project_Cost) || 0,
      projectSizeSqft: parseFloat(row.Project_Size_SqFt) || 0,
      submittedBy: row.Submitted_By,
      verified: row.Verified === 'TRUE',
      notes: row.Notes
    });
  });
  
  return store;
};

/**
 * Fetch just pricing data and convert to store format
 * @returns {Promise<Object>} pricingStore-compatible object
 */
export const fetchPricingStore = async () => {
  const data = await fetchSheetData('pricing');
  if (data.success && data.pricing) {
    return convertSheetPricingToStore(data.pricing);
  }
  return {};
};
