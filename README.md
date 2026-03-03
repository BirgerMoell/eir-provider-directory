# 🏥 EIR Provider Directory

**Comprehensive open-source healthcare provider database for Sweden**

A modern web application providing searchable access to 17,000+ Swedish healthcare providers with interactive mapping, advanced filtering, and detailed provider information.

[![Made for EIR Open](https://img.shields.io/badge/Made%20for-EIR%20Open-blue)](https://eir-space.github.io/eir-open/)
[![Data Source](https://img.shields.io/badge/Data%20Source-1177.se-green)](https://1177.se)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## ✨ Features

### 🔍 **Smart Search**
- **Full-text search** across provider names, addresses, and specialties
- **Auto-suggestions** with real-time results
- **Natural language queries** ("dermatologist accepting eigen remiss near Stockholm")
- **Search history** and popular searches

### 🗺️ **Interactive Map**
- **Geographic visualization** of all healthcare providers
- **Clustering** for dense urban areas
- **Filter by location** with radius-based search
- **Mobile-responsive** map controls

### 📋 **Advanced Filtering**
- **Provider types**: Primary care, specialists, hospitals, dental, emergency
- **Services**: Self-referrals (egen remiss), video consultations, MVK services
- **Specialties**: Dermatology, orthopedics, cardiology, and more
- **Quick filters** for common search scenarios

### 📊 **Comprehensive Data**
- **17,803 healthcare providers** across Sweden
- **98% geographic coverage** with GPS coordinates
- **99% contact information** with phone numbers
- **42% self-referral eligible** providers marked
- **Real-time statistics** and data quality metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/eir-space/provider-directory.git
cd provider-directory

# Install dependencies
npm install

# Process the healthcare data (one-time setup)
node scripts/process-swedish-data.js

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 📊 **Data Processing**

The application uses real healthcare data from Sweden's national healthcare portal (1177.se):

```bash
# Process data from source files
node scripts/process-swedish-data.js

# This creates:
# - public/data/providers-sweden.json (full dataset)
# - public/data/providers-sweden-sample.json (500 providers for testing)
```

## 🏗️ Architecture

### **Frontend**
- **Next.js 14** - React framework with SSR/SSG
- **React 18** - Modern React with hooks
- **Vanilla CSS** - No external CSS frameworks for performance
- **Responsive Design** - Mobile-first approach

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **File-based Database** - JSON data with efficient querying
- **No External Database** - Simplified deployment

### **Data Pipeline**
- **Source**: 1177.se healthcare provider data
- **Processing**: Node.js scripts with categorization logic
- **Standardization**: Unified schema across all providers
- **Validation**: Data quality checks and statistics

## 📡 API Reference

### **GET /api/providers**

Retrieve healthcare providers with filtering options.

```bash
# Get all providers (paginated)
curl "http://localhost:3000/api/providers"

# Filter by type
curl "http://localhost:3000/api/providers?type=specialist"

# Geographic search
curl "http://localhost:3000/api/providers?lat=59.3293&lng=18.0686&radius=10"

# Self-referral providers only
curl "http://localhost:3000/api/providers?self_referral=true"

# Search by specialty
curl "http://localhost:3000/api/providers?specialty=dermatologi"
```

**Query Parameters:**
- `type`: Filter by provider type (`primary_care`, `specialist`, `hospital`, `dental`, etc.)
- `specialty`: Filter by medical specialty
- `self_referral`: Filter providers accepting self-referrals (`true`/`false`)
- `lat`, `lng`, `radius`: Geographic filtering (radius in km)
- `location`: Text search in addresses
- `limit`: Number of results (default: 1000)
- `offset`: Pagination offset (default: 0)
- `sample`: Use sample dataset for faster loading (`true`/`false`)

### **GET /api/search**

Advanced search with scoring and suggestions.

```bash
# Search providers
curl "http://localhost:3000/api/search?q=vårdcentral+stockholm"

# Get search suggestions
curl "http://localhost:3000/api/search?q=derma"
```

**Response Format:**
```json
{
  "query": "dermatologi",
  "total": 45,
  "results": [
    {
      "id": "SE2321000206-E01234",
      "name": "Dermatologmottagningen Stockholm",
      "type": "specialist",
      "specialty": ["dermatology"],
      "contact": {
        "phone": "08-123 45 67",
        "website": "https://www.1177.se/..."
      },
      "location": {
        "address": "Storgatan 1, Stockholm",
        "coordinates": { "lat": 59.3293, "lng": 18.0686 }
      },
      "services": {
        "self_referral": true,
        "video_consultation": false
      },
      "searchScore": 85,
      "matchedFields": ["name", "specialty"]
    }
  ]
}
```

## 📊 Data Schema

Healthcare providers follow a standardized schema:

```typescript
interface HealthcareProvider {
  id: string              // HSA ID (Swedish healthcare identifier)
  name: string           // Official provider name
  type: ProviderType     // primary_care | specialist | hospital | dental | emergency | mental_health | pediatric | maternity | other
  specialty: string[]    // Medical specialties (dermatology, cardiology, etc.)
  
  contact: {
    phone?: string              // Swedish phone number
    internationalPhone?: string // International format
    email?: string             // Contact email (limited availability)
    website?: string           // 1177.se profile URL
  }
  
  location: {
    address?: string           // Full address
    coordinates: {
      lat: number             // Latitude
      lng: number             // Longitude
    }
  }
  
  services: {
    self_referral: boolean          // Accepts eigen remiss
    video_consultation: boolean     // Offers video consultations
    mvk_services: boolean          // MVK services available
    has_listing: boolean           // Has 1177.se listing
  }
  
  metadata: {
    country: 'SE'                  // Country code
    source: '1177.se'              // Data source
    updated: string                // Last update timestamp
    eigen_remiss_research: boolean // Included in research
  }
}
```

## 🗂️ Project Structure

```
eir-provider-directory/
├── components/              # React components
│   ├── SearchBar.js        # Smart search with suggestions
│   ├── FilterPanel.js      # Advanced filtering controls
│   ├── ProviderMap.js      # Geographic provider display
│   ├── ProviderList.js     # List view with sorting
│   └── StatsPanel.js       # Database statistics
├── pages/                  # Next.js pages
│   ├── api/               # API endpoints
│   │   ├── providers.js   # Provider data API
│   │   └── search.js      # Search API
│   ├── index.js          # Main application page
│   └── 404.js            # Custom 404 page
├── public/data/           # Healthcare data
│   ├── providers-sweden.json        # Full dataset (17k providers)
│   └── providers-sweden-sample.json # Sample dataset (500 providers)
├── scripts/               # Data processing scripts
│   └── process-swedish-data.js     # Convert source data to standard format
├── styles/               # CSS styles
│   └── globals.css       # Application styles
└── README.md            # This file
```

## 🔧 Development

### **Adding New Data Sources**

To add healthcare providers from other countries:

1. Create a new processing script in `scripts/`
2. Follow the standardized schema
3. Add country-specific type mappings
4. Update the API to handle multiple countries

### **Extending Search**

The search system supports multiple scoring factors:

```javascript
// Search scoring weights
const SCORING = {
  NAME_MATCH: 100,        // Provider name match
  NAME_PREFIX: 50,        // Name starts with query
  SPECIALTY_MATCH: 40,    // Specialty match
  ADDRESS_MATCH: 30,      // Address contains query
  TYPE_MATCH: 20,         // Provider type match
  SELF_REFERRAL_BOOST: 10 // Boost for eigen remiss
}
```

### **Performance Optimization**

- **Sample dataset**: Use `?sample=true` for faster development
- **Pagination**: API returns max 1000 results by default
- **Caching**: Static data enables aggressive caching
- **Mobile optimization**: Progressive enhancement for mobile devices

## 📈 Statistics

Current database coverage:

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Providers** | 17,803 | 100% |
| **With GPS Coordinates** | 17,453 | 98.0% |
| **With Phone Numbers** | 17,638 | 99.1% |
| **With Full Addresses** | 17,515 | 98.4% |
| **Self-Referral Eligible** | 7,541 | 42.4% |

### Provider Types:
- **Specialists**: 6,935 (38.9%)
- **Other Services**: 5,324 (29.9%) 
- **Primary Care**: 2,709 (15.2%)
- **Hospitals**: 1,221 (6.9%)
- **Dental Care**: 1,129 (6.3%)
- **Pediatric**: 384 (2.2%)
- **Mental Health**: 46 (0.3%)
- **Maternity**: 41 (0.2%)
- **Emergency**: 14 (0.1%)

## ☁️ Cloudflare Data Stack

The production deployment uses:

- **Workers Assets** for frontend static files
- **R2 (`eir-provider-data`)** for full JSON snapshots (including `providers-sweden-verified.json`)
- **D1 (`eir-provider-db`)** as the primary query backend for `/api/providers` and `/api/search`

### D1 Commands

```bash
# Create database (one-time)
npm run d1:create

# Apply schema migration
npm run d1:migrate

# Import verified dataset from public/data/providers-sweden-verified.json
npm run d1:import:verified

# Run migration + import together
npm run d1:bootstrap
```

### R2 Commands

```bash
# Create bucket (one-time)
npm run r2:create-bucket

# Upload all provider JSON snapshots to remote R2
npm run r2:upload:all
```

## 🌟 Future Enhancements

### **Planned Features**
- [ ] **Real-time availability** integration
- [ ] **Appointment booking** partnerships
- [ ] **Provider reviews** and ratings
- [ ] **Multi-language support** (English, Arabic, etc.)
- [ ] **Accessibility features** for disabled users
- [ ] **Progressive Web App** capabilities
- [ ] **Email acquisition** via HSA Katalogen API
- [ ] **International expansion** to other Nordic countries

### **Technical Improvements**
- [ ] **Full mapping integration** (Mapbox/Leaflet)
- [ ] **Database migration** to PostgreSQL with PostGIS
- [ ] **Real-time updates** from 1177.se API
- [ ] **Advanced analytics** dashboard
- [ ] **API rate limiting** and authentication
- [ ] **Automated testing** suite

## 🤝 Contributing

This project is part of the **EIR Open** initiative. Contributions are welcome!

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 About EIR Open

EIR Provider Directory is part of **EIR Open**, a collection of open-source tools for healthcare and health literacy.

- **Website**: [eir-space.github.io/eir-open](https://eir-space.github.io/eir-open/)
- **Organization**: [EIR Space](https://eir.space)
- **Mission**: Empowering people in their health journey through accessible technology

### **Other EIR Open Projects**
- **Swedish Medications** - Complete pharmaceutical database
- **US FDA Medications** - US medication lookup with interactions
- **EIR Health Data Standard** - YAML-based health data format
- **Agent Core** - Health AI agent framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/eir-space/provider-directory/issues)
- **Discussions**: [GitHub Discussions](https://github.com/eir-space/provider-directory/discussions)
- **Email**: Contact via [EIR Space](https://eir.space)

---

**Built with ❤️ for Swedish healthcare accessibility**
