import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Vibration,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import SwipeCard from '../components/SwipeCard';
import { generateNextDomain } from '../data/mockDomains';

const { height } = Dimensions.get('window');

export default function SwipeScreen({ navigation, route }) {
  const { keyword = '', startContinuousMode = false } = route.params || {};
  const [currentDomain, setCurrentDomain] = useState(null);
  const [nextDomain, setNextDomain] = useState(null);
  const [usedDomainIds, setUsedDomainIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, count, isInCart } = useCart();

  // Initialize first domains
  useEffect(() => {
    if (keyword && startContinuousMode) {
      loadInitialDomains();
    }
  }, [keyword, startContinuousMode]);

  const loadInitialDomains = () => {
    setIsLoading(true);
    
    // Generate first domain
    const firstDomain = generateNextDomain(keyword, usedDomainIds);
    setCurrentDomain(firstDomain);
    setUsedDomainIds(prev => new Set([...prev, firstDomain.id]));
    
    // Preload next domain
    const secondDomain = generateNextDomain(keyword, new Set([...usedDomainIds, firstDomain.id]));
    setNextDomain(secondDomain);
    
    setIsLoading(false);
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

  const loadNextDomain = () => {
    // Move next domain to current
    setCurrentDomain(nextDomain);
    setUsedDomainIds(prev => new Set([...prev, nextDomain?.id]));
    
    // Generate new next domain
    const newNextDomain = generateNextDomain(keyword, new Set([...usedDomainIds, nextDomain?.id]));
    setNextDomain(newNextDomain);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.neonGlowContainer}>
            <Ionicons name="search" size={60} color="#00ff41" />
          </View>
          <Text style={styles.loadingTitle}>Finding domains...</Text>
          <Text style={styles.loadingSubtitle}>
            Searching for "{keyword}" variations
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentDomain) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color="#888" />
          <Text style={styles.emptyTitle}>No Domains Found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different keyword
          </Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back to Search</Text>
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

      {/* Clean Footer */}
      <View style={styles.footer}>
        <Text style={styles.keywordText}>"{keyword}"</Text>
        <Text style={styles.instructionText}>Keep swiping to discover more</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  loadingSubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
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
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartContainer: {
    position: 'relative',
  },
  cartIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,255,65,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.3)',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0a0a0a',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  swipeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  keywordText: {
    color: '#00ff41',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  backButtonLarge: {
    backgroundColor: '#00ff41',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 