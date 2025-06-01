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

// Enhanced domain generation for continuous swiping
export const generateMockDomains = (keyword, count = 10) => {
  const extensions = ['.com', '.io', '.net', '.org', '.co', '.app', '.dev', '.tech', '.online', '.store', '.shop', '.biz', '.info', '.me', '.tv', '.cc'];
  const prefixes = ['smart', 'quick', 'easy', 'pro', 'fast', 'new', 'best', 'super', 'mega', 'ultra', 'top', 'prime', 'elite', 'master', 'expert', 'digital', 'cyber', 'tech', 'cloud', 'web', 'net', 'data', 'ai', 'auto', 'modern', 'future', 'next', 'advanced', 'innovative'];
  const suffixes = ['hub', 'lab', 'zone', 'world', 'space', 'point', 'center', 'studio', 'works', 'solutions', 'systems', 'tech', 'pro', 'plus', 'max', 'expert', 'guru', 'ninja', 'master', 'wizard', 'genius', 'boost', 'force', 'power', 'edge', 'core', 'base', 'spot', 'place', 'site', 'web', 'net', 'link', 'connect', 'bridge', 'portal', 'gateway'];
  
  const domains = [];
  
  // Generate exact matches
  extensions.slice(0, Math.min(count / 4, extensions.length)).forEach((ext, index) => {
    domains.push({
      id: `${keyword}_exact_${index + 1}_${Date.now()}`,
      name: `${keyword}${ext}`,
      price: Math.floor(Math.random() * 100) + 8.99,
      available: Math.random() > 0.2, // 80% availability
      extension: ext,
      category: 'search'
    });
  });
  
  // Generate with prefixes
  const selectedPrefixes = prefixes.sort(() => 0.5 - Math.random()).slice(0, Math.min(count / 4, prefixes.length));
  selectedPrefixes.forEach((prefix, index) => {
    const ext = extensions[index % extensions.length];
    domains.push({
      id: `${prefix}_${keyword}_${index + 100}_${Date.now()}`,
      name: `${prefix}${keyword}${ext}`,
      price: Math.floor(Math.random() * 150) + 12.99,
      available: Math.random() > 0.15,
      extension: ext,
      category: 'search'
    });
  });
  
  // Generate with suffixes
  const selectedSuffixes = suffixes.sort(() => 0.5 - Math.random()).slice(0, Math.min(count / 4, suffixes.length));
  selectedSuffixes.forEach((suffix, index) => {
    const ext = extensions[index % extensions.length];
    domains.push({
      id: `${keyword}_${suffix}_${index + 200}_${Date.now()}`,
      name: `${keyword}${suffix}${ext}`,
      price: Math.floor(Math.random() * 80) + 15.99,
      available: Math.random() > 0.2,
      extension: ext,
      category: 'search'
    });
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
    
    domains.push({
      id: `creative_${i}_${Date.now()}_${Math.random()}`,
      name: selectedVariation,
      price: Math.floor(Math.random() * 200) + 10.99,
      available: Math.random() > 0.25,
      extension: ext,
      category: 'search'
    });
  }
  
  // Shuffle and return only available domains
  return domains.filter(domain => domain.available).sort(() => 0.5 - Math.random());
};

// Generate a single domain for continuous swiping
export const generateNextDomain = (keyword, usedIds = new Set()) => {
  const extensions = ['.com', '.io', '.net', '.org', '.co', '.app', '.dev', '.tech', '.online', '.store'];
  const prefixes = ['smart', 'quick', 'easy', 'pro', 'fast', 'new', 'best', 'super', 'mega', 'ultra', 'digital', 'modern', 'next'];
  const suffixes = ['hub', 'lab', 'zone', 'world', 'space', 'center', 'studio', 'works', 'solutions', 'tech', 'plus', 'max'];
  
  let domain;
  let attempts = 0;
  
  do {
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
    
    domain = {
      id: `continuous_${Date.now()}_${Math.random()}`,
      name: `${name}${ext}`,
      price: Math.floor(Math.random() * 150) + 8.99,
      available: true, // Always available for continuous mode
      extension: ext,
      category: 'search'
    };
    
    attempts++;
  } while (usedIds.has(domain.id) && attempts < 10);
  
  return domain;
}; 