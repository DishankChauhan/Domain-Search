import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Vibration,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import SwipeCard from '../components/SwipeCard';
import { generateNextDomain, generateDomainWithLoading } from '../data/mockDomains';

const { height } = Dimensions.get('window');

export default function SwipeScreen({ navigation, route }) {
  const { keyword = '', startContinuousMode = false } = route.params || {};
  const [currentDomain, setCurrentDomain] = useState(null);
  const [nextDomain, setNextDomain] = useState(null);
  const [usedDomainIds, setUsedDomainIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const { addToCart, count, isInCart } = useCart();

  // Initialize first domains
  useEffect(() => {
    if (keyword && startContinuousMode) {
      loadInitialDomains();
    }
  }, [keyword, startContinuousMode]);

  const loadInitialDomains = async () => {
    setIsLoading(true);
    
    try {
      // Generate first domain with loading state
      const { loadingDomain, promise } = generateDomainWithLoading(keyword, usedDomainIds);
      
      // Show loading domain immediately
      setCurrentDomain(loadingDomain);
      
      // Wait for real domain data
      const firstDomain = await promise;
      setCurrentDomain(firstDomain);
      setUsedDomainIds(prev => new Set([...prev, firstDomain.id]));
      
      // Preload next domain in background
      preloadNextDomain(new Set([...usedDomainIds, firstDomain.id]));
      
    } catch (error) {
      console.error('Error loading initial domains:', error);
      // Fallback to simple domain
      const fallbackDomain = {
        id: `fallback_${Date.now()}`,
        name: `${keyword}.com`,
        price: 12.99,
        available: true,
        extension: '.com',
        category: 'search',
        registrar: 'GoDaddy',
        premium: false,
        suggested: [],
        checkingAvailability: false
      };
      setCurrentDomain(fallbackDomain);
    } finally {
      setIsLoading(false);
    }
  };

  const preloadNextDomain = async (currentUsedIds) => {
    try {
      const nextDomainData = await generateNextDomain(keyword, currentUsedIds);
      setNextDomain(nextDomainData);
    } catch (error) {
      console.error('Error preloading next domain:', error);
    }
  };

  const handleSwipeRight = (domain) => {
    // Add to cart with haptic feedback (no popup alert)
    Vibration.vibrate(50);
    
    if (!isInCart(domain.id)) {
      addToCart(domain);
    }
    
    // Move to next domain
    loadNextDomain();
  };

  const handleSwipeLeft = (domain) => {
    // No vibration for skip - just smooth transition
    console.log('Skipped:', domain.name);
    
    // Move to next domain
    loadNextDomain();
  };

  const loadNextDomain = async () => {
    if (nextDomain) {
      // Move next domain to current
      setCurrentDomain(nextDomain);
      setUsedDomainIds(prev => new Set([...prev, nextDomain.id]));
      
      // Clear next domain and start loading new one
      setNextDomain(null);
      setIsLoadingNext(true);
      
      // Generate new next domain in background
      try {
        const newNextDomain = await generateNextDomain(keyword, new Set([...usedDomainIds, nextDomain.id]));
        setNextDomain(newNextDomain);
      } catch (error) {
        console.error('Error loading next domain:', error);
      } finally {
        setIsLoadingNext(false);
      }
    } else {
      // If no next domain ready, show loading state
      const { loadingDomain, promise } = generateDomainWithLoading(keyword, usedDomainIds);
      setCurrentDomain(loadingDomain);
      
      try {
        const newDomain = await promise;
        setCurrentDomain(newDomain);
        setUsedDomainIds(prev => new Set([...prev, newDomain.id]));
        
        // Preload next domain
        preloadNextDomain(new Set([...usedDomainIds, newDomain.id]));
      } catch (error) {
        console.error('Error loading domain:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.neonGlowContainer}>
            <Ionicons name="search" size={60} color="#00ff41" />
          </View>
          <Text style={styles.loadingTitle}>Finding available domains...</Text>
          <Text style={styles.loadingSubtitle}>
            Checking real availability for "{keyword}"
          </Text>
          <View style={styles.loadingSteps}>
            <Text style={styles.loadingStep}>🔍 Generating domain variations</Text>
            <Text style={styles.loadingStep}>🌐 Checking availability</Text>
            <Text style={styles.loadingStep}>💰 Getting real pricing</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentDomain) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color="#888" />
          <Text style={styles.emptyTitle}>No Available Domains Found</Text>
          <Text style={styles.emptySubtitle}>
            All "{keyword}" variations seem to be taken. Try a different keyword.
          </Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Try Different Keyword</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <View style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Domain Discovery</Text>
          <Text style={styles.headerSubtitle}>"{keyword}"</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')}
          style={styles.headerButton}
        >
          <View style={styles.cartContainer}>
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart-outline" size={24} color="#00ff41" />
              {count > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{count}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Swipe Area */}
      <View style={styles.swipeArea}>
        <SwipeCard
          key={currentDomain.id}
          domain={currentDomain}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
        />
      </View>

      {/* Enhanced Footer */}
      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Checking</Text>
            <Text style={styles.statValue}>Real Availability</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Showing</Text>
            <Text style={styles.statValue}>Live Pricing</Text>
          </View>
        </View>
        
        <Text style={styles.instructionText}>
          {currentDomain.checkingAvailability 
            ? "Verifying domain availability..." 
            : "Swipe to discover more available domains"
          }
        </Text>
        
        {isLoadingNext && (
          <View style={styles.preloadingIndicator}>
            <Ionicons name="sync" size={12} color="#00ff41" />
            <Text style={styles.preloadingText}>Preparing next domain...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
    }),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  neonGlowContainer: {
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingSteps: {
    alignItems: 'flex-start',
    gap: 8,
  },
  loadingStep: {
    color: '#00ff41',
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerButton: {
    padding: 8,
    minWidth: 50,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#00ff41',
    fontSize: 14,
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartContainer: {
    alignItems: 'center',
  },
  cartIconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,65,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#00ff41',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  swipeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      WebkitOverflowScrolling: 'touch',
      maxWidth: '100vw',
      display: 'flex',
      overflowX: 'hidden',
    }),
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(0,255,65,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: '#00ff41',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,255,65,0.2)',
    marginHorizontal: 20,
  },
  instructionText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  preloadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  preloadingText: {
    color: '#00ff41',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  backButtonLarge: {
    backgroundColor: '#00ff41',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 