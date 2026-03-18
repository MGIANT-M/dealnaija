export const formatPrice = (price) => {
  if (!price) return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(price)
}

export const formatSize = (size, unit) => {
  if (!size) return '—'
  const labels = { m2: 'm²', acre: 'acres', hectare: 'hectares', sqft: 'sq ft', plot: 'plots' }
  return parseFloat(size).toLocaleString() + ' ' + (labels[unit] || unit)
}

export const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
]

export const SELLER_TYPES = [
  { value: 'bank', label: 'Bank / Financial Institution' },
  { value: 'company', label: 'Company' },
  { value: 'private_owner', label: 'Private Owner' },
  { value: 'government', label: 'Government' }
]

export const TITLE_DOCUMENTS = [
  { value: 'C_of_O', label: 'Certificate of Occupancy (C of O)' },
  { value: 'deed_of_assignment', label: 'Deed of Assignment' },
  { value: 'survey_plan', label: 'Survey Plan' },
  { value: 'gazette', label: 'Gazette' },
  { value: 'governors_consent', label: "Governor's Consent" },
  { value: 'none', label: 'None' }
]

export const SIZE_UNITS = [
  { value: 'plot', label: 'Plot(s)' },
  { value: 'm2', label: 'Square Metres (m²)' },
  { value: 'acre', label: 'Acre(s)' },
  { value: 'hectare', label: 'Hectare(s)' },
  { value: 'sqft', label: 'Square Feet' }
]

export const VERIFICATION_BADGE = {
  basic: { label: 'Basic Listing', color: 'bg-gray-100 text-gray-600', icon: '○' },
  document_verified: { label: 'Doc Verified', color: 'bg-blue-100 text-blue-700', icon: '✓' },
  fully_verified: { label: 'Fully Verified', color: 'bg-green-100 text-green-700', icon: '✓✓' }
}

export const DEAL_STAGES = [
  { key: 'inquiry_received', label: 'Inquiry Received', step: 1 },
  { key: 'inspection_scheduled', label: 'Inspection Scheduled', step: 2 },
  { key: 'negotiation', label: 'Negotiation', step: 3 },
  { key: 'deal_closed', label: 'Deal Closed', step: 4 }
]

export const generateWhatsAppMessage = (property) => {
  const text = 'Land for Sale - ' + (property.city || '') + ', ' + property.state + '\n\n' +
    'Size: ' + formatSize(property.land_size, property.size_unit) + '\n' +
    'Price: ' + formatPrice(property.price) + '\n' +
    'Seller: ' + (property.seller_type || '').replace('_', ' ') + '\n\n' +
    'View details:\n' + window.location.origin + '/properties/' + property.id
  return encodeURIComponent(text)
}

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2348000000000'
