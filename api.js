// API functions for Portuguese emergency monitoring services

class EmergencyMonitorAPI {
  constructor() {
    this.baseUrls = {
      fogos: 'https://api.fogos.pt',
      ipma: 'https://api.ipma.pt/open-data'
    };
  }

  // Fetch active fires from Fogos.pt
  async getFires() {
    try {
      const response = await fetch(`${this.baseUrls.fogos}/v2/incidents/search?all`);
      if (!response.ok) throw new Error('Failed to fetch fires data');
      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching fires:', error);
      return {
        success: false,
        error: error.message,
        data: this.getMockFiresData()
      };
    }
  }

  // Fetch weather warnings from IPMA
  async getWeatherWarnings() {
    try {
      const response = await fetch(`${this.baseUrls.ipma}/forecast/warnings/warnings_www.json`);
      if (!response.ok) throw new Error('Failed to fetch weather warnings');
      const data = await response.json();
      return {
        success: true,
        data: data || [],
        total: data.length || 0
      };
    } catch (error) {
      console.error('Error fetching weather warnings:', error);
      return {
        success: false,
        error: error.message,
        data: this.getMockWeatherData()
      };
    }
  }

  // Fetch earthquake data from IPMA
  async getEarthquakes() {
    try {
      const response = await fetch(`${this.baseUrls.ipma}/earthquake/earthquake.json`);
      if (!response.ok) throw new Error('Failed to fetch earthquake data');
      const data = await response.json();
      return {
        success: true,
        data: data || [],
        total: data.length || 0
      };
    } catch (error) {
      console.error('Error fetching earthquakes:', error);
      return {
        success: false,
        error: error.message,
        data: this.getMockEarthquakeData()
      };
    }
  }

  // Get all emergency data
  async getAllEmergencyData() {
    const [fires, weather, earthquakes] = await Promise.all([
      this.getFires(),
      this.getWeatherWarnings(),
      this.getEarthquakes()
    ]);

    return {
      fires,
      weather,
      earthquakes,
      timestamp: new Date().toISOString()
    };
  }

  // Calculate proximity alerts (fires and earthquakes within specified radius)
  getProximityAlerts(userLat, userLon, fires, earthquakes, radiusKm = 50) {
    const alerts = [];

    // Check fires proximity
    fires.data.forEach(fire => {
      if (fire.lat && fire.lng) {
        const distance = this.calculateDistance(userLat, userLon, fire.lat, fire.lng);
        if (distance <= radiusKm) {
          alerts.push({
            type: 'fire',
            severity: 'high',
            distance: Math.round(distance),
            location: fire.location || fire.parish || 'Localização desconhecida',
            data: fire
          });
        }
      }
    });

    // Check earthquakes proximity
    earthquakes.data.forEach(quake => {
      if (quake.lat && quake.lon) {
        const distance = this.calculateDistance(userLat, userLon, quake.lat, quake.lon);
        const magnitude = parseFloat(quake.magnitude) || 0;
        if (distance <= radiusKm && magnitude >= 3.0) {
          alerts.push({
            type: 'earthquake',
            severity: magnitude >= 5.0 ? 'high' : 'medium',
            distance: Math.round(distance),
            magnitude: magnitude,
            location: quake.local || 'Localização desconhecida',
            data: quake
          });
        }
      }
    });

    return alerts.sort((a, b) => a.distance - b.distance);
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI/180);
  }

  // Mock data for development/fallback
  getMockFiresData() {
    return [
      {
        id: '1',
        location: 'Serra da Estrela',
        parish: 'Covilhã',
        district: 'Castelo Branco',
        lat: 40.3369,
        lng: -7.6122,
        status: 'Ativo',
        means: '45 operacionais, 15 veículos',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        location: 'Parque Natural da Peneda-Gerês',
        parish: 'Arcos de Valdevez',
        district: 'Viana do Castelo',
        lat: 41.8833,
        lng: -8.4167,
        status: 'Em resolução',
        means: '23 operacionais, 8 veículos',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  getMockWeatherData() {
    return [
      {
        id: 'warning1',
        type: 'Tempestade',
        severity: 'Amarelo',
        region: 'Norte',
        description: 'Possibilidade de trovoadas intensas',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'warning2',
        type: 'Vento forte',
        severity: 'Laranja',
        region: 'Centro',
        description: 'Ventos até 80 km/h',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  getMockEarthquakeData() {
    return [
      {
        id: 'eq1',
        magnitude: '3.2',
        lat: 38.7223,
        lon: -9.1393,
        depth: '12 km',
        local: 'Lisboa',
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'eq2',
        magnitude: '2.8',
        lat: 37.0179,
        lon: -7.9304,
        depth: '8 km',
        local: 'Faro',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

// Initialize API
const emergencyAPI = new EmergencyMonitorAPI();