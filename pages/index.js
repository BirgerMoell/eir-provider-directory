import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import SearchBar from '../components/SearchBar'
import ProviderMap from '../components/ProviderMap'
import ProviderList from '../components/ProviderList'
import FilterPanel from '../components/FilterPanel'
import StatsPanel from '../components/StatsPanel'

export default function Home({ metadata, statistics }) {
  const [providers, setProviders] = useState([])
  const [filteredProviders, setFilteredProviders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'
  const [selectedProvider, setSelectedProvider] = useState(null)

  // Load provider data on mount
  useEffect(() => {
    async function loadProviders() {
      try {
        setLoading(true)
        // Load sample data initially for faster loading
        const response = await fetch('/api/providers?sample=true')
        const data = await response.json()
        setProviders(data.providers)
        setFilteredProviders(data.providers)
      } catch (error) {
        console.error('Error loading providers:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProviders()
  }, [])

  // Filter providers when search or filters change
  useEffect(() => {
    let filtered = providers

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(query) ||
        (provider.location.address && provider.location.address.toLowerCase().includes(query)) ||
        provider.specialty.some(s => s.toLowerCase().includes(query)) ||
        provider.type.toLowerCase().includes(query)
      )
    }

    setFilteredProviders(filtered)
  }, [providers, searchQuery, selectedType])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleTypeFilter = (type) => {
    setSelectedType(type)
  }

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Head>
          <title>EIR Provider Directory - Loading...</title>
        </Head>
        <div className="loading-spinner">
          <h2>🏥 Loading Swedish Healthcare Providers...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Head>
        <title>EIR Provider Directory - Swedish Healthcare Providers</title>
        <meta name="description" content="Comprehensive directory of Swedish healthcare providers with interactive map and search" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 EIR Provider Directory</h1>
          <p>Comprehensive Swedish Healthcare Provider Database</p>
          
          <div className="header-stats">
            <span>{filteredProviders.length.toLocaleString()} providers</span>
            {searchQuery && <span>matching "{searchQuery}"</span>}
            {selectedType !== 'all' && <span>• {selectedType.replace('_', ' ')}</span>}
          </div>
        </div>
        
        <div className="view-toggle">
          <button 
            className={viewMode === 'map' ? 'active' : ''}
            onClick={() => setViewMode('map')}
          >
            🗺️ Map
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
        </div>
      </header>

      {/* Search and Filter Controls */}
      <div className="controls-container">
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search by name, address, or specialty..."
          value={searchQuery}
        />
        
        <FilterPanel 
          selectedType={selectedType}
          onTypeFilter={handleTypeFilter}
          statistics={statistics}
        />
      </div>

      {/* Main Content */}
      <main className="main-content">
        {viewMode === 'map' ? (
          <ProviderMap 
            providers={filteredProviders}
            onProviderSelect={handleProviderSelect}
            selectedProvider={selectedProvider}
          />
        ) : (
          <ProviderList 
            providers={filteredProviders}
            onProviderSelect={handleProviderSelect}
            selectedProvider={selectedProvider}
          />
        )}
      </main>

      {/* Provider Details Sidebar */}
      {selectedProvider && (
        <div className="provider-details-overlay">
          <div className="provider-details">
            <div className="provider-header">
              <h3>{selectedProvider.name}</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedProvider(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="provider-info">
              <div className="provider-type">
                <span className={`type-badge ${selectedProvider.type}`}>
                  {selectedProvider.type.replace('_', ' ')}
                </span>
                {selectedProvider.services.self_referral && (
                  <span className="eigen-remiss-badge">Egen remiss OK</span>
                )}
              </div>

              {selectedProvider.specialty.length > 0 && (
                <div className="specialties">
                  <strong>Specialties:</strong> {selectedProvider.specialty.join(', ')}
                </div>
              )}

              {selectedProvider.location.address && (
                <div className="address">
                  <strong>📍 Address:</strong><br />
                  {selectedProvider.location.address}
                </div>
              )}

              {selectedProvider.contact.phone && (
                <div className="phone">
                  <strong>📞 Phone:</strong><br />
                  <a href={`tel:${selectedProvider.contact.phone}`}>
                    {selectedProvider.contact.phone}
                  </a>
                </div>
              )}

              <div className="services">
                <strong>Services:</strong>
                <ul>
                  {selectedProvider.services.self_referral && 
                    <li>✅ Accepts self-referrals (egen remiss)</li>
                  }
                  {selectedProvider.services.video_consultation && 
                    <li>💻 Video consultation available</li>
                  }
                  {selectedProvider.services.mvk_services && 
                    <li>🏥 MVK services available</li>
                  }
                </ul>
              </div>

              {selectedProvider.contact.website && (
                <div className="website">
                  <a 
                    href={selectedProvider.contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    📱 View on 1177.se →
                  </a>
                </div>
              )}

              <div className="metadata">
                <small>
                  HSA ID: {selectedProvider.id}<br />
                  Data source: {selectedProvider.metadata.source}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>EIR Provider Directory</strong> - Open source healthcare provider database
          </p>
          <p>
            Data sourced from 1177.se • Part of <a href="https://eir.space" target="_blank" rel="noopener noreferrer">EIR Space</a> health literacy initiative
          </p>
          <p>
            <small>
              {metadata.total_providers.toLocaleString()} providers • 
              Last updated: {new Date(metadata.generated).toLocaleDateString()}
            </small>
          </p>
        </div>
      </footer>
    </div>
  )
}

// Get statistics for filter panel
export async function getStaticProps() {
  const fs = require('fs')
  const path = require('path')
  
  try {
    const filePath = path.join(process.cwd(), 'public/data/providers-sweden-sample.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    return {
      props: {
        metadata: data.metadata,
        statistics: data.statistics
      }
    }
  } catch (error) {
    return {
      props: {
        metadata: { total_providers: 0, generated: new Date().toISOString() },
        statistics: { total: 0, by_type: {} }
      }
    }
  }
}