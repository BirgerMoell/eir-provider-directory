import { useState } from 'react'

const TYPE_LABELS = {
  all: 'All Types',
  primary_care: 'Primary Care',
  specialist: 'Specialists',
  hospital: 'Hospitals',
  dental: 'Dental Care',
  emergency: 'Emergency',
  mental_health: 'Mental Health',
  pediatric: 'Pediatric',
  maternity: 'Maternity',
  other: 'Other'
}

const TYPE_ICONS = {
  all: '🏥',
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

export default function FilterPanel({ selectedType, onTypeFilter, statistics }) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState({
    selfReferral: false,
    videoConsultation: false,
    mvkServices: false
  })

  const handleTypeChange = (type) => {
    onTypeFilter(type)
  }

  const handleAdvancedFilterChange = (filterName) => {
    const newFilters = {
      ...filters,
      [filterName]: !filters[filterName]
    }
    setFilters(newFilters)
    // TODO: Implement advanced filtering logic
  }

  // Get sorted types by count for display
  const sortedTypes = Object.entries(statistics.by_type || {})
    .sort(([,a], [,b]) => b - a)
    .map(([type, count]) => ({ type, count }))

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <h3>Filter by Type</h3>
        
        <div className="filter-types">
          {/* All Types */}
          <button
            className={`type-filter ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => handleTypeChange('all')}
          >
            <span className="filter-icon">{TYPE_ICONS.all}</span>
            <span className="filter-label">{TYPE_LABELS.all}</span>
            <span className="filter-count">({statistics.total?.toLocaleString() || '0'})</span>
          </button>

          {/* Individual Types */}
          {sortedTypes.map(({ type, count }) => (
            <button
              key={type}
              className={`type-filter ${selectedType === type ? 'active' : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              <span className="filter-icon">{TYPE_ICONS[type] || '📋'}</span>
              <span className="filter-label">{TYPE_LABELS[type] || type}</span>
              <span className="filter-count">({count.toLocaleString()})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="filter-section">
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>Advanced Filters</span>
          <span className={`toggle-icon ${showAdvanced ? 'open' : ''}`}>▼</span>
        </button>

        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-group">
              <h4>Services</h4>
              
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.selfReferral}
                  onChange={() => handleAdvancedFilterChange('selfReferral')}
                />
                <span className="checkbox-icon">✅</span>
                <span className="checkbox-label">Accepts Self-Referrals (Egen Remiss)</span>
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.videoConsultation}
                  onChange={() => handleAdvancedFilterChange('videoConsultation')}
                />
                <span className="checkbox-icon">💻</span>
                <span className="checkbox-label">Video Consultation Available</span>
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.mvkServices}
                  onChange={() => handleAdvancedFilterChange('mvkServices')}
                />
                <span className="checkbox-icon">🏥</span>
                <span className="checkbox-label">MVK Services Available</span>
              </label>
            </div>

            <div className="filter-group">
              <h4>Quick Filters</h4>
              
              <div className="quick-filters">
                <button 
                  className="quick-filter-btn"
                  onClick={() => {
                    setFilters({ ...filters, selfReferral: true })
                    handleTypeChange('specialist')
                  }}
                >
                  🎯 Eigen Remiss Specialists
                </button>
                
                <button 
                  className="quick-filter-btn"
                  onClick={() => {
                    setFilters({ ...filters, videoConsultation: true })
                    handleTypeChange('all')
                  }}
                >
                  💻 Digital Consultations
                </button>
                
                <button 
                  className="quick-filter-btn"
                  onClick={() => handleTypeChange('primary_care')}
                >
                  🩺 Nearest Primary Care
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Summary */}
      {(selectedType !== 'all' || Object.values(filters).some(f => f)) && (
        <div className="filter-summary">
          <div className="active-filters">
            <span className="summary-label">Active filters:</span>
            
            {selectedType !== 'all' && (
              <span className="active-filter">
                {TYPE_ICONS[selectedType]} {TYPE_LABELS[selectedType]}
                <button onClick={() => handleTypeChange('all')}>✕</button>
              </span>
            )}

            {filters.selfReferral && (
              <span className="active-filter">
                ✅ Self-Referrals
                <button onClick={() => handleAdvancedFilterChange('selfReferral')}>✕</button>
              </span>
            )}

            {filters.videoConsultation && (
              <span className="active-filter">
                💻 Video Consultation
                <button onClick={() => handleAdvancedFilterChange('videoConsultation')}>✕</button>
              </span>
            )}

            {filters.mvkServices && (
              <span className="active-filter">
                🏥 MVK Services
                <button onClick={() => handleAdvancedFilterChange('mvkServices')}>✕</button>
              </span>
            )}
          </div>

          <button 
            className="clear-filters-btn"
            onClick={() => {
              handleTypeChange('all')
              setFilters({
                selfReferral: false,
                videoConsultation: false,
                mvkServices: false
              })
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="filter-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{statistics.with_coordinates || 0}</span>
            <span className="stat-label">With GPS</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-number">{statistics.with_phone || 0}</span>
            <span className="stat-label">With Phone</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-number">{statistics.self_referral_eligible || 0}</span>
            <span className="stat-label">Egen Remiss</span>
          </div>
        </div>
      </div>
    </div>
  )
}