import DomainAvailabilityService from '../services/DomainAvailabilityService';

export const mockDomains = [
  {
    id: 1,
    name: "techstartup.com",
    price: 12.99,
    available: true,
    extension: ".com",
    category: "tech"
  },
  {
    id: 2,
    name: "innovateai.io",
    price: 45.99,
    available: true,
    extension: ".io",
    category: "tech"
  },
  {
    id: 3,
    name: "digitalwave.net",
    price: 8.99,
    available: true,
    extension: ".net",
    category: "tech"
  },
  {
    id: 4,
    name: "cloudventure.org",
    price: 15.99,
    available: true,
    extension: ".org",
    category: "business"
  },
  {
    id: 5,
    name: "smartsolutions.com",
    price: 22.99,
    available: true,
    extension: ".com",
    category: "business"
  },
  {
    id: 6,
    name: "nextgenbiz.io",
    price: 67.99,
    available: true,
    extension: ".io",
    category: "business"
  },
  {
    id: 7,
    name: "creativestudio.design",
    price: 89.99,
    available: true,
    extension: ".design",
    category: "creative"
  },
  {
    id: 8,
    name: "artflow.gallery",
    price: 125.99,
    available: true,
    extension: ".gallery",
    category: "creative"
  }
];

// Enhanced domain generation with real availability checking
export const generateMockDomains = async (keyword, count = 10) => {
  const extensions = ['.com', '.io', '.net', '.org', '.co', '.app', '.dev', '.tech', '.online', '.store', '.shop', '.biz', '.info', '.me', '.tv', '.cc'];
  const prefixes = ['smart', 'quick', 'easy', 'pro', 'fast', 'new', 'best', 'super', 'mega', 'ultra', 'top', 'prime', 'elite', 'master', 'expert', 'digital', 'cyber', 'tech', 'cloud', 'web', 'net', 'data', 'ai', 'auto', 'modern', 'future', 'next', 'advanced', 'innovative'];
  const suffixes = ['hub', 'lab', 'zone', 'world', 'space', 'point', 'center', 'studio', 'works', 'solutions', 'systems', 'tech', 'pro', 'plus', 'max', 'expert', 'guru', 'ninja', 'master', 'wizard', 'genius', 'boost', 'force', 'power', 'edge', 'core', 'base', 'spot', 'place', 'site', 'web', 'net', 'link', 'connect', 'bridge', 'portal', 'gateway'];
  
  const domains = [];
  
  // Generate exact matches
  extensions.slice(0, Math.min(count / 4, extensions.length)).forEach((ext, index) => {
    domains.push(`${keyword}${ext}`);
  });
  
  // Generate with prefixes
  const selectedPrefixes = prefixes.sort(() => 0.5 - Math.random()).slice(0, Math.min(count / 4, prefixes.length));
  selectedPrefixes.forEach((prefix, index) => {
    const ext = extensions[index % extensions.length];
    domains.push(`${prefix}${keyword}${ext}`);
  });
  
  // Generate with suffixes
  const selectedSuffixes = suffixes.sort(() => 0.5 - Math.random()).slice(0, Math.min(count / 4, suffixes.length));
  selectedSuffixes.forEach((suffix, index) => {
    const ext = extensions[index % extensions.length];
    domains.push(`${keyword}${suffix}${ext}`);
  });
  
  // Generate creative combinations
  const remainingCount = count - domains.length;
  for (let i = 0; i < remainingCount; i++) {
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const ext = extensions[Math.floor(Math.random() * extensions.length)];
    
    // Create variations
    const variations = [
      `${randomPrefix}${keyword}${ext}`,
      `${keyword}${randomSuffix}${ext}`,
      `${randomPrefix}${keyword}${randomSuffix}${ext}`,
      `${keyword}${Math.floor(Math.random() * 999) + 1}${ext}`,
      `${keyword}${['pro', 'max', 'plus', 'premium', 'elite'][Math.floor(Math.random() * 5)]}${ext}`
    ];
    
    const selectedVariation = variations[Math.floor(Math.random() * variations.length)];
    domains.push(selectedVariation);
  }
  
  // Check availability for all generated domains
  try {
    const availabilityResults = await DomainAvailabilityService.checkMultipleDomains(domains);
    
    return availabilityResults
      .filter(domain => domain.available)
      .map((domain, index) => ({
        id: `${keyword}_${index}_${Date.now()}`,
        name: domain.domain,
        price: domain.price,
        available: domain.available,
        extension: '.' + domain.domain.split('.').pop(),
        category: 'search',
        registrar: domain.registrar,
        premium: domain.premium,
        suggested: domain.suggested || []
      }))
      .sort(() => 0.5 - Math.random());
  } catch (error) {
    console.error('Error checking domain availability:', error);
    // Fallback to mock data if availability service fails
    return domains.slice(0, count).map((domainName, index) => ({
      id: `fallback_${keyword}_${index}_${Date.now()}`,
      name: domainName,
      price: Math.floor(Math.random() * 100) + 8.99,
      available: true,
      extension: '.' + domainName.split('.').pop(),
      category: 'search',
      registrar: 'GoDaddy',
      premium: false,
      suggested: []
    }));
  }
};

// Generate a single domain with real availability checking
export const generateNextDomain = async (keyword, usedIds = new Set()) => {
  const extensions = ['.com', '.io', '.net', '.org', '.co', '.app', '.dev', '.tech', '.online', '.store'];
  const prefixes = ['smart', 'quick', 'easy', 'pro', 'fast', 'new', 'best', 'super', 'mega', 'ultra', 'digital', 'modern', 'next'];
  const suffixes = ['hub', 'lab', 'zone', 'world', 'space', 'center', 'studio', 'works', 'solutions', 'tech', 'plus', 'max'];
  
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const ext = extensions[Math.floor(Math.random() * extensions.length)];
    const usePrefix = Math.random() > 0.5;
    const useSuffix = Math.random() > 0.5;
    
    let name = keyword;
    
    if (usePrefix) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      name = prefix + name;
    }
    
    if (useSuffix) {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      name = name + suffix;
    }
    
    // Sometimes add numbers
    if (Math.random() > 0.8) {
      name = name + (Math.floor(Math.random() * 999) + 1);
    }
    
    const domainName = `${name}${ext}`;
    const domainId = `continuous_${Date.now()}_${Math.random()}`;
    
    // Skip if already used
    if (usedIds.has(domainId)) {
      attempts++;
      continue;
    }
    
    try {
      // Check real availability
      const availabilityResult = await DomainAvailabilityService.checkAvailability(domainName);
      
      if (availabilityResult.available) {
        return {
          id: domainId,
          name: domainName,
          price: availabilityResult.price,
          available: availabilityResult.available,
          extension: ext,
          category: 'search',
          registrar: availabilityResult.registrar,
          premium: availabilityResult.premium,
          suggested: availabilityResult.suggested || [],
          checkingAvailability: false
        };
      } else {
        // If not available, try alternatives
        if (availabilityResult.suggested && availabilityResult.suggested.length > 0) {
          const alternativeDomain = availabilityResult.suggested[0];
          const altAvailability = await DomainAvailabilityService.checkAvailability(alternativeDomain);
          
          if (altAvailability.available) {
            return {
              id: `${domainId}_alt`,
              name: alternativeDomain,
              price: altAvailability.price,
              available: altAvailability.available,
              extension: '.' + alternativeDomain.split('.').pop(),
              category: 'search',
              registrar: altAvailability.registrar,
              premium: altAvailability.premium,
              suggested: [],
              isAlternative: true,
              originalRequest: domainName,
              checkingAvailability: false
            };
          }
        }
      }
    } catch (error) {
      console.error('Error checking domain availability:', error);
      // Fallback to mock domain if service fails
      return {
        id: domainId,
        name: domainName,
        price: Math.floor(Math.random() * 150) + 8.99,
        available: true,
        extension: ext,
        category: 'search',
        registrar: 'GoDaddy',
        premium: false,
        suggested: [],
        checkingAvailability: false
      };
    }
    
    attempts++;
  }
  
  // If we can't find any available domains, return a fallback
  return {
    id: `fallback_${Date.now()}_${Math.random()}`,
    name: `${keyword}${Math.floor(Math.random() * 999)}.com`,
    price: Math.floor(Math.random() * 150) + 8.99,
    available: true,
    extension: '.com',
    category: 'search',
    registrar: 'GoDaddy',
    premium: false,
    suggested: [],
    checkingAvailability: false
  };
};

// Generate domain with loading state (for immediate UI response)
export const generateDomainWithLoading = (keyword, usedIds = new Set()) => {
  const extensions = ['.com', '.io', '.net', '.org', '.co'];
  const ext = extensions[Math.floor(Math.random() * extensions.length)];
  
  const loadingDomain = {
    id: `loading_${Date.now()}_${Math.random()}`,
    name: `${keyword}${ext}`,
    price: 0,
    available: true,
    extension: ext,
    category: 'search',
    registrar: null,
    premium: false,
    suggested: [],
    checkingAvailability: true
  };
  
  // Return loading domain immediately, then check availability
  const promise = generateNextDomain(keyword, usedIds);
  
  return { loadingDomain, promise };
}; 