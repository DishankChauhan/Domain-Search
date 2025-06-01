import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { mockDomains, generateMockDomains } from '../data/mockDomains';

export default function SearchScreen({ navigation }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { count } = useCart();

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('Enter a keyword', 'Please enter a domain keyword to search');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Navigate to swipe screen immediately with the keyword
      // The SwipeScreen will handle continuous domain generation
      navigation.navigate('Swipe', { 
        keyword: searchKeyword.toLowerCase(),
        startContinuousMode: true
      });
    }, 500); // Reduced delay for better UX
  };

  const handleTrendingDomainPress = (domain) => {
    // Start continuous mode based on the trending domain's category
    navigation.navigate('Swipe', { 
      keyword: domain.category,
      startContinuousMode: true
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DomainSwipe</Text>
          <Text style={styles.subtitle}>Find your perfect domain</Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Domains</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter domain name or keyword..."
              placeholderTextColor="#888"
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            <Text style={styles.searchButtonText}>
              {isLoading ? 'Finding domains...' : 'Start Swiping'}
            </Text>
            <View style={styles.neonArrowGlow}>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Search for a domain keyword</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Swipe right to add, left to skip</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Keep swiping - unlimited domains!</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Check your cart anytime</Text>
            </View>
          </View>
        </View>

        {/* Trending Categories */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>Trending Categories</Text>
          <Text style={styles.sectionSubtitle}>Tap to start swiping in a category</Text>
          
          <View style={styles.domainGrid}>
            {mockDomains.slice(0, 6).map((domain) => (
              <TouchableOpacity
                key={domain.id}
                style={styles.domainCard}
                onPress={() => handleTrendingDomainPress(domain)}
              >
                <Text style={styles.domainName}>{domain.name}</Text>
                <Text style={styles.domainPrice}>${domain.price}</Text>
                <View style={styles.domainCategory}>
                  <Text style={styles.domainCategoryText}>{domain.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart" size={24} color="#00ff41" />
            <Text style={styles.actionButtonText}>View Cart</Text>
            {count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  searchSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 56,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#00ff41',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#555',
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  neonArrowGlow: {
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  howItWorksSection: {
    marginBottom: 40,
  },
  stepContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  stepNumber: {
    backgroundColor: '#00ff41',
    color: '#000',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 18,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stepText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  trendingSection: {
    marginBottom: 40,
  },
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  domainCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 18,
    width: '48%',
    borderWidth: 1,
    borderColor: '#333',
  },
  domainName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  domainPrice: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  domainCategory: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  domainCategoryText: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  quickActions: {
    alignItems: 'center',
    paddingTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00ff41',
    gap: 12,
    position: 'relative',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: '600',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 