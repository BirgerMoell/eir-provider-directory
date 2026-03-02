import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { method, query } = req
  
  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Determine which dataset to use
    const useSample = query.sample === 'true'
    const filename = useSample ? 'providers-sweden-sample.json' : 'providers-sweden.json'
    const filePath = path.join(process.cwd(), 'public/data', filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Provider data not found' })
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    let providers = data.providers

    // Apply filters
    const { 
      type, 
      specialty,
      self_referral,
      location,
      lat,
      lng,
      radius = 50, // km
      limit = 1000,
      offset = 0
    } = query

    // Filter by type
    if (type && type !== 'all') {
      providers = providers.filter(p => p.type === type)
    }

    // Filter by specialty
    if (specialty) {
      providers = providers.filter(p => 
        p.specialty.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      )
    }

    // Filter by self-referral capability
    if (self_referral === 'true') {
      providers = providers.filter(p => p.services.self_referral === true)
    }

    // Geographic filtering (if lat/lng provided)
    if (lat && lng) {
      const centerLat = parseFloat(lat)
      const centerLng = parseFloat(lng)
      const maxRadius = parseFloat(radius)
      
      providers = providers.filter(provider => {
        const providerLat = provider.location.coordinates.lat
        const providerLng = provider.location.coordinates.lng
        
        if (!providerLat || !providerLng) return false
        
        // Simple distance calculation (Haversine formula)
        const distance = calculateDistance(centerLat, centerLng, providerLat, providerLng)
        return distance <= maxRadius
      }).map(provider => ({
        ...provider,
        distance: calculateDistance(centerLat, centerLng, 
          provider.location.coordinates.lat, 
          provider.location.coordinates.lng
        )
      })).sort((a, b) => a.distance - b.distance)
    }

    // Text search in location
    if (location) {
      const searchTerm = location.toLowerCase()
      providers = providers.filter(p => 
        (p.location.address && p.location.address.toLowerCase().includes(searchTerm)) ||
        p.name.toLowerCase().includes(searchTerm)
      )
    }

    // Pagination
    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedProviders = providers.slice(startIndex, endIndex)

    // Response
    res.status(200).json({
      metadata: {
        total: providers.length,
        returned: paginatedProviders.length,
        offset: startIndex,
        limit: parseInt(limit),
        filters_applied: {
          type: type || null,
          specialty: specialty || null,
          self_referral: self_referral === 'true' || null,
          location: location || null,
          geographic: !!(lat && lng)
        }
      },
      providers: paginatedProviders
    })

  } catch (error) {
    console.error('Error serving providers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}