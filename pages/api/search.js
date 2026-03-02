import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { method, query } = req
  
  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q, limit = 50 } = query

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' })
  }

  try {
    const filePath = path.join(process.cwd(), 'public/data/providers-sweden.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    let providers = data.providers

    const searchTerm = q.toLowerCase().trim()
    
    // Search across multiple fields with scoring
    const searchResults = providers.map(provider => {
      let score = 0
      let matchedFields = []

      // Name match (highest priority)
      if (provider.name.toLowerCase().includes(searchTerm)) {
        score += 100
        if (provider.name.toLowerCase().startsWith(searchTerm)) {
          score += 50 // Boost for prefix match
        }
        matchedFields.push('name')
      }

      // Address match
      if (provider.location.address && provider.location.address.toLowerCase().includes(searchTerm)) {
        score += 30
        matchedFields.push('address')
      }

      // Specialty match
      const specialtyMatch = provider.specialty.find(s => s.toLowerCase().includes(searchTerm))
      if (specialtyMatch) {
        score += 40
        matchedFields.push('specialty')
      }

      // Type match
      if (provider.type.toLowerCase().includes(searchTerm) || 
          provider.type.replace('_', ' ').toLowerCase().includes(searchTerm)) {
        score += 20
        matchedFields.push('type')
      }

      // HSA ID match (exact)
      if (provider.id.toLowerCase() === searchTerm) {
        score += 200
        matchedFields.push('id')
      }

      // Phone number match
      if (provider.contact.phone && provider.contact.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))) {
        score += 10
        matchedFields.push('phone')
      }

      // Boost for self-referral providers
      if (provider.services.self_referral && score > 0) {
        score += 10
      }

      return {
        ...provider,
        searchScore: score,
        matchedFields
      }
    })
    .filter(provider => provider.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, parseInt(limit))

    // Generate search suggestions if no results
    let suggestions = []
    if (searchResults.length === 0) {
      suggestions = generateSearchSuggestions(searchTerm, providers)
    }

    res.status(200).json({
      query: searchTerm,
      total: searchResults.length,
      results: searchResults,
      suggestions,
      metadata: {
        search_time: new Date().toISOString(),
        limit: parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Error performing search:', error)
    res.status(500).json({ error: 'Search failed' })
  }
}

function generateSearchSuggestions(searchTerm, providers) {
  const suggestions = new Set()
  
  // Find similar names
  providers.forEach(provider => {
    const name = provider.name.toLowerCase()
    
    // If the search term is contained in the name, suggest the full name
    if (name.includes(searchTerm) && name !== searchTerm) {
      suggestions.add(provider.name)
    }
    
    // Suggest specialties
    provider.specialty.forEach(specialty => {
      if (specialty.toLowerCase().includes(searchTerm)) {
        suggestions.add(specialty)
      }
    })
  })

  // Add common healthcare terms
  const commonTerms = [
    'vårdcentral', 'mottagning', 'sjukhus', 'klinik', 'hälsocentral',
    'dermatologi', 'ortopedi', 'kardiologi', 'neurologi', 'psykiatri',
    'gynekologi', 'urologi', 'ögon', 'önh', 'tandvård'
  ]
  
  commonTerms.forEach(term => {
    if (term.includes(searchTerm) || searchTerm.includes(term.substring(0, 3))) {
      suggestions.add(term)
    }
  })

  return Array.from(suggestions).slice(0, 5)
}