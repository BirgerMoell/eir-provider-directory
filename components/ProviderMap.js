import { useEffect, useRef, useState } from 'react'

// We'll use a simple map implementation without external dependencies for now
// In production, you'd use Mapbox GL JS or Leaflet

export default function ProviderMap({ providers, onProviderSelect, selectedProvider }) {
  const mapRef = useRef(null)
  const [mapCenter, setMapCenter] = useState({ lat: 59.3293, lng: 18.0686 }) // Stockholm
  const [mapZoom, setMapZoom] = useState(6)
  const [loading, setLoading] = useState(true)

  // For now, we'll create a simple provider list with map-like styling
  // This is a placeholder until we can integrate a proper mapping library
  
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Group providers by approximate location for clustering
  const groupProvidersByLocation = (providers) => {
    const groups = new Map()
    
    providers.forEach(provider => {
      if (!provider.location.coordinates.lat || !provider.location.coordinates.lng) return
      
      // Round coordinates to create location groups (simple clustering)
      const roundedLat = Math.round(provider.location.coordinates.lat * 100) / 100
      const roundedLng = Math.round(provider.location.coordinates.lng * 100) / 100
      const key = `${roundedLat},${roundedLng}`
      
      if (!groups.has(key)) {
        groups.set(key, {
          lat: roundedLat,
          lng: roundedLng,
          providers: []
        })
      }
      
      groups.get(key).providers.push(provider)
    })
    
    return Array.from(groups.values())
  }

  const locationGroups = groupProvidersByLocation(providers)

  // Calculate map bounds to fit all providers
  const calculateBounds = (providers) => {
    if (providers.length === 0) return null
    
    const lats = providers.map(p => p.location.coordinates.lat).filter(lat => lat)
    const lngs = providers.map(p => p.location.coordinates.lng).filter(lng => lng)
    
    if (lats.length === 0) return null
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    }
  }

  const bounds = calculateBounds(providers)

  const handleLocationClick = (group) => {
    if (group.providers.length === 1) {
      onProviderSelect(group.providers[0])
    } else {
      // For multiple providers, zoom in or show list
      setMapCenter({ lat: group.lat, lng: group.lng })
      setMapZoom(Math.min(mapZoom + 2, 15))
    }
  }

  const getMarkerColor = (provider) => {
    switch (provider.type) {
      case 'primary_care': return '#10B981' // green
      case 'specialist': return '#3B82F6' // blue
      case 'hospital': return '#EF4444' // red
      case 'dental': return '#F59E0B' // amber
      case 'emergency': return '#DC2626' // red
      case 'mental_health': return '#8B5CF6' // purple
      default: return '#6B7280' // gray
    }
  }

  if (loading) {
    return (
      <div className="map-container loading">
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="map-container">
      {/* Map Header */}
      <div className="map-header">
        <div className="map-stats">
          <span>{providers.length} providers shown</span>
          {bounds && (
            <span>
              • {locationGroups.length} locations
            </span>
          )}
        </div>
        
        <div className="map-controls">
          <button 
            className="map-control-btn"
            onClick={() => setMapZoom(Math.min(mapZoom + 1, 15))}
            title="Zoom in"
          >
            🔍+
          </button>
          <button 
            className="map-control-btn"
            onClick={() => setMapZoom(Math.max(mapZoom - 1, 4))}
            title="Zoom out"
          >
            🔍-
          </button>
          <button 
            className="map-control-btn"
            onClick={() => {
              setMapCenter({ lat: 59.3293, lng: 18.0686 })
              setMapZoom(6)
            }}
            title="Reset view"
          >
            🎯
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Provider Types</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-marker" style={{backgroundColor: '#10B981'}}></div>
            <span>Primary Care</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker" style={{backgroundColor: '#3B82F6'}}></div>
            <span>Specialists</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker" style={{backgroundColor: '#EF4444'}}></div>
            <span>Hospitals</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker" style={{backgroundColor: '#F59E0B'}}></div>
            <span>Dental</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker" style={{backgroundColor: '#8B5CF6'}}></div>
            <span>Mental Health</span>
          </div>
        </div>
      </div>

      {/* Simplified Map View (Geographic List) */}
      <div className="geo-list-container" ref={mapRef}>
        {locationGroups.length === 0 ? (
          <div className="no-providers">
            <h3>No providers found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="location-groups">
            {locationGroups
              .sort((a, b) => b.providers.length - a.providers.length)
              .map((group, index) => (
                <div
                  key={index}
                  className={`location-group ${selectedProvider && group.providers.some(p => p.id === selectedProvider.id) ? 'selected' : ''}`}
                  onClick={() => handleLocationClick(group)}
                >
                  <div className="location-header">
                    <div className="location-marker">
                      <div 
                        className="marker-dot"
                        style={{ backgroundColor: getMarkerColor(group.providers[0]) }}
                      >
                        {group.providers.length > 1 ? group.providers.length : ''}
                      </div>
                    </div>
                    
                    <div className="location-info">
                      <h4>
                        {group.providers.length === 1 
                          ? group.providers[0].name 
                          : `${group.providers.length} providers in area`
                        }
                      </h4>
                      <p className="location-coords">
                        📍 {group.lat.toFixed(4)}, {group.lng.toFixed(4)}
                        {group.providers[0].location.address && (
                          <span> • {group.providers[0].location.address.split(',')[1] || group.providers[0].location.address}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Show provider details if single provider or if expanded */}
                  {group.providers.length === 1 && (
                    <div className="provider-preview">
                      <div className="provider-type">
                        <span className={`type-badge ${group.providers[0].type}`}>
                          {group.providers[0].type.replace('_', ' ')}
                        </span>
                        {group.providers[0].services.self_referral && (
                          <span className="service-badge">Egen remiss</span>
                        )}
                      </div>
                      
                      {group.providers[0].contact.phone && (
                        <p className="contact-info">
                          📞 {group.providers[0].contact.phone}
                        </p>
                      )}
                      
                      {group.providers[0].specialty.length > 0 && (
                        <p className="specialties">
                          <strong>Specialties:</strong> {group.providers[0].specialty.slice(0, 3).join(', ')}
                          {group.providers[0].specialty.length > 3 && '...'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show grouped providers if multiple */}
                  {group.providers.length > 1 && (
                    <div className="grouped-providers">
                      <div className="provider-types">
                        {[...new Set(group.providers.map(p => p.type))].map(type => (
                          <span key={type} className={`type-chip ${type}`}>
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      
                      <div className="provider-names">
                        {group.providers.slice(0, 3).map(provider => (
                          <div key={provider.id} className="provider-name">
                            {provider.name}
                          </div>
                        ))}
                        {group.providers.length > 3 && (
                          <div className="provider-name more">
                            +{group.providers.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="location-action">
                    <span className="action-hint">
                      {group.providers.length === 1 ? 'Click for details' : 'Click to view all'}
                    </span>
                    <span className="action-arrow">→</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Map Footer */}
      <div className="map-footer">
        <p>
          <strong>Note:</strong> This is a simplified geographic view. 
          A full interactive map will be available in the next version.
        </p>
        <p>
          <small>
            Data from 1177.se • Geographic coordinates available for {providers.filter(p => p.location.coordinates.lat).length}/{providers.length} providers
          </small>
        </p>
      </div>
    </div>
  )
}