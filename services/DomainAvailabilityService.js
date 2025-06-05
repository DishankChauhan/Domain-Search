/**
 * Domain Availability Service
 * Checks if domains are actually available for registration
 */

const DOMAIN_API_ENDPOINTS = {
  // Free APIs for domain checking
  whoisXML: 'https://www.whoisxmlapi.com/whoisserver/WhoisService',
  domainr: 'https://domainr.p.rapidapi.com/v2/status'
};

class DomainAvailabilityService {
  /**
   * Check if a domain is available for registration
   * @param {string} domain - Domain to check (e.g., 'example.com')
   * @returns {Promise<{available: boolean, price: number, registrar: string}>}
   */
  async checkAvailability(domain) {
    try {
      // For demo purposes, we'll simulate availability
      // In production, integrate with actual domain APIs
      
      const isAvailable = Math.random() > 0.3; // 70% available rate
      const basePrice = this.calculateDomainPrice(domain);
      
      return {
        domain,
        available: isAvailable,
        price: basePrice,
        registrar: isAvailable ? 'GoDaddy' : null,
        premium: domain.length <= 4,
        suggested: isAvailable ? [] : this.generateAlternatives(domain)
      };
    } catch (error) {
      console.error('Domain availability check failed:', error);
      return {
        domain,
        available: false,
        price: 0,
        registrar: null,
        error: 'Unable to check availability'
      };
    }
  }

  /**
   * Calculate domain price based on length and demand
   */
  calculateDomainPrice(domain) {
    const baseName = domain.split('.')[0];
    const extension = domain.split('.')[1] || 'com';
    
    let price = 12; // Base price in USD
    
    // Premium pricing for short domains
    if (baseName.length <= 3) price = 999;
    else if (baseName.length <= 4) price = 299;
    else if (baseName.length <= 5) price = 99;
    else if (baseName.length <= 6) price = 49;
    
    // Extension multipliers
    const extensionMultipliers = {
      'com': 1.0,
      'net': 0.8,
      'org': 0.7,
      'io': 1.5,
      'ai': 2.0,
      'crypto': 3.0,
      'sol': 2.5
    };
    
    price *= (extensionMultipliers[extension] || 0.5);
    
    return Math.round(price);
  }

  /**
   * Generate alternative domain suggestions
   */
  generateAlternatives(domain) {
    const baseName = domain.split('.')[0];
    const alternatives = [];
    
    // Add prefixes/suffixes
    const prefixes = ['get', 'try', 'use', 'my', 'the'];
    const suffixes = ['app', 'pro', 'hq', 'io', 'ai'];
    
    prefixes.forEach(prefix => {
      alternatives.push(`${prefix}${baseName}.com`);
    });
    
    suffixes.forEach(suffix => {
      alternatives.push(`${baseName}${suffix}.com`);
    });
    
    // Alternative extensions
    const extensions = ['net', 'org', 'io', 'ai', 'co'];
    extensions.forEach(ext => {
      alternatives.push(`${baseName}.${ext}`);
    });
    
    return alternatives.slice(0, 5); // Return top 5 alternatives
  }

  /**
   * Bulk check multiple domains
   */
  async checkMultipleDomains(domains) {
    const promises = domains.map(domain => this.checkAvailability(domain));
    return Promise.all(promises);
  }
}

export default new DomainAvailabilityService(); 