import { useState, useMemo } from 'react'

export default function ProviderList({ providers, onProviderSelect, selectedProvider }) {
  const [sortBy, setSortBy] = useState('name') // 'name', 'type', 'location'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'
  const [viewMode, setViewMode] = useState('compact') // 'compact', 'detailed'

  // Sort providers
  const sortedProviders = useMemo(() => {
    return [...providers].sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'type':
          aVal = a.type
          bVal = b.type
          break
        case 'location':
          aVal = a.location.address || ''
          bVal = b.location.address || ''
          break
        default:
          return 0
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [providers, sortBy, sortOrder])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️'
    return sortOrder === 'asc' ? '↗️' : '↘️'
  }

  const getTypeIcon = (type) => {
    const icons = {
      primary_care: '🩺',
      specialist: '👨‍⚕️',
      hospital: '🏨',
      dental: '🦷',
      emergency: '🚑',
      mental_health: '🧠',
      pediatric: '👶',
      maternity: '🤱',
      other: '📋'
    }
    return icons[type] || '🏥'
  }

  if (providers.length === 0) {
    return (
      <div className="provider-list empty">
        <div className="empty-state">
          <h3>No providers found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="provider-list">
      {/* List Controls */}
      <div className="list-controls">
        <div className="sort-controls">
          <span>Sort by:</span>
          <button
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => handleSort('name')}
          >
            Name {getSortIcon('name')}
          </button>
          <button
            className={`sort-btn ${sortBy === 'type' ? 'active' : ''}`}
            onClick={() => handleSort('type')}
          >
            Type {getSortIcon('type')}
          </button>
          <button
            className={`sort-btn ${sortBy === 'location' ? 'active' : ''}`}
            onClick={() => handleSort('location')}
          >
            Location {getSortIcon('location')}
          </button>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
            onClick={() => setViewMode('compact')}
          >
            📋 Compact
          </button>
          <button
            className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            📄 Detailed
          </button>
        </div>
      </div>

      <div className="list-stats">
        <span>Showing {sortedProviders.length} providers</span>
      </div>

      {/* Provider List */}
      <div className={`providers-container ${viewMode}`}>
        {sortedProviders.map((provider) => (
          <div
            key={provider.id}
            className={`provider-item ${selectedProvider?.id === provider.id ? 'selected' : ''} ${viewMode}`}
            onClick={() => onProviderSelect(provider)}
          >
            {/* Provider Header */}
            <div className="provider-header">
              <div className="provider-icon">
                {getTypeIcon(provider.type)}
              </div>
              
              <div className="provider-title">
                <h3>{provider.name}</h3>
                <div className="provider-badges">
                  <span className={`type-badge ${provider.type}`}>
                    {provider.type.replace('_', ' ')}
                  </span>
                  {provider.services.self_referral && (
                    <span className="service-badge eigen-remiss">
                      ✅ Eigen Remiss
                    </span>
                  )}
                  {provider.services.video_consultation && (
                    <span className="service-badge video">
                      💻 Video
                    </span>
                  )}
                </div>
              </div>

              <div className="provider-action">
                <span className="action-arrow">→</span>
              </div>
            </div>

            {/* Provider Details (shown in detailed view or when selected) */}
            {(viewMode === 'detailed' || selectedProvider?.id === provider.id) && (
              <div className="provider-details">
                {provider.location.address && (
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{provider.location.address}</span>
                  </div>
                )}

                {provider.contact.phone && (
                  <div className="detail-item">
                    <span className="detail-icon">📞</span>
                    <a href={`tel:${provider.contact.phone}`} className="detail-link">
                      {provider.contact.phone}
                    </a>
                  </div>
                )}

                {provider.specialty.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-icon">🩹</span>
                    <span className="detail-text">
                      <strong>Specialties:</strong> {provider.specialty.join(', ')}
                    </span>
                  </div>
                )}

                <div className="detail-item services">
                  <span className="detail-icon">⚙️</span>
                  <div className="services-list">
                    <strong>Services:</strong>
                    <ul>
                      {provider.services.self_referral && 
                        <li>✅ Accepts self-referrals</li>
                      }
                      {provider.services.video_consultation && 
                        <li>💻 Video consultation</li>
                      }
                      {provider.services.mvk_services && 
                        <li>🏥 MVK services</li>
                      }
                      {!provider.services.self_referral && 
                       !provider.services.video_consultation && 
                       !provider.services.mvk_services && 
                        <li>📋 Standard healthcare services</li>
                      }
                    </ul>
                  </div>
                </div>

                {provider.contact.website && (
                  <div className="detail-item">
                    <span className="detail-icon">🌐</span>
                    <a 
                      href={provider.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="detail-link website-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on 1177.se →
                    </a>
                  </div>
                )}

                <div className="detail-item metadata">
                  <span className="detail-icon">🆔</span>
                  <span className="detail-text">
                    <small>HSA ID: {provider.id}</small>
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions (compact view) */}
            {viewMode === 'compact' && (
              <div className="quick-actions">
                {provider.contact.phone && (
                  <button
                    className="quick-action-btn phone"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`tel:${provider.contact.phone}`, '_self')
                    }}
                    title={`Call ${provider.contact.phone}`}
                  >
                    📞
                  </button>
                )}
                
                {provider.contact.website && (
                  <button
                    className="quick-action-btn website"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(provider.contact.website, '_blank')
                    }}
                    title="View on 1177.se"
                  >
                    🌐
                  </button>
                )}

                {provider.location.coordinates.lat && provider.location.coordinates.lng && (
                  <button
                    className="quick-action-btn directions"
                    onClick={(e) => {
                      e.stopPropagation()
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.location.coordinates.lat},${provider.location.coordinates.lng}`
                      window.open(url, '_blank')
                    }}
                    title="Get directions"
                  >
                    🗺️
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* List Footer */}
      <div className="list-footer">
        <p>
          <small>
            Showing {sortedProviders.length} of {providers.length} providers •
            Data from 1177.se
          </small>
        </p>
      </div>
    </div>
  )
}