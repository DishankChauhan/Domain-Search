import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useSolana } from '../context/SolanaContext';

export default function CartScreen({ navigation }) {
  const { items, total, count, removeFromCart, clearCart } = useCart();
  const { getSOLPrice, convertUSDToSOL } = useSolana();
  
  const [currentSOLPrice, setCurrentSOLPrice] = useState(0);

  useEffect(() => {
    // Get current SOL price when component mounts
    const price = getSOLPrice();
    setCurrentSOLPrice(price);
  }, []);

  const handleRemoveItem = (domain) => {
    if (Platform.OS === 'web') {
      // For web, use window.confirm instead of Alert
      const confirmed = window.confirm(`Remove ${domain.name} from cart?`);
      if (confirmed) {
        removeFromCart(domain.id);
      }
    } else {
      // For mobile, use Alert
      Alert.alert(
        'Remove Domain',
        `Remove ${domain.name} from cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => removeFromCart(domain.id)
          }
        ]
      );
    }
  };

  const handleClearCart = () => {
    if (Platform.OS === 'web') {
      // For web, use window.confirm instead of Alert
      const confirmed = window.confirm('Remove all domains from cart?');
      if (confirmed) {
        clearCart();
      }
    } else {
      // For mobile, use Alert
      Alert.alert(
        'Clear Cart',
        'Remove all domains from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear All', 
            style: 'destructive',
            onPress: clearCart
          }
        ]
      );
    }
  };

  const handleCheckout = () => {
    // Navigate to the new Solana checkout screen
    navigation.navigate('Checkout');
  };

  const solAmount = convertUSDToSOL(total);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        )}
        {items.length === 0 && <View style={{ width: 24 }} />}
      </View>

      {items.length === 0 ? (
        /* Empty Cart State */
        <View style={styles.emptyContainer}>
          <View style={styles.neonCartGlow}>
            <Ionicons name="cart-outline" size={80} color="#888" />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Search for domains and swipe right to add them to your cart
          </Text>
          
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color="#000" />
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Cart with Items */
        <View style={styles.cartContainer}>
          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Domains:</Text>
              <Text style={styles.summaryValue}>{count}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total (USD):</Text>
              <Text style={styles.summaryTotal}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>SOL Price:</Text>
              <Text style={styles.summaryValue}>${currentSOLPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total (SOL):</Text>
              <Text style={styles.summaryTotalSOL}>≈ {solAmount.toFixed(4)} SOL</Text>
            </View>
          </View>

          {/* Domain List */}
          <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
            {items.map((domain, index) => (
              <View key={domain.id} style={styles.domainItem}>
                <View style={styles.domainInfo}>
                  <Text style={styles.domainName}>{domain.name}</Text>
                  <View style={styles.domainMeta}>
                    <View style={styles.extensionBadge}>
                      <Text style={styles.extensionText}>{domain.extension}</Text>
                    </View>
                    <Text style={styles.domainCategory}>{domain.category}</Text>
                  </View>
                </View>
                
                <View style={styles.domainActions}>
                  <Text style={styles.domainPrice}>${domain.price}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(domain)}
                  >
                    <Ionicons name="close" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Ionicons name="add" size={20} color="#00ff41" />
              <Text style={styles.continueButtonText}>Add More</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Ionicons name="flash" size={20} color="#000" />
              <Text style={styles.checkoutButtonText}>Pay with SOL</Text>
            </TouchableOpacity>
          </View>
          
          {/* Solana Info */}
          <View style={styles.solanaInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#888" />
            <Text style={styles.solanaInfoText}>
              Secure payments powered by Solana blockchain (Devnet)
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 80,
  },
  neonCartGlow: {
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff41',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  shopButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  cartContainer: {
    flex: 1,
    paddingTop: 20,
  },
  summaryContainer: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 16,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryTotalSOL: {
    color: '#00ff41',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  domainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  domainMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  extensionBadge: {
    backgroundColor: '#00ff41',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  extensionText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  domainCategory: {
    color: '#888',
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  domainActions: {
    alignItems: 'flex-end',
  },
  domainPrice: {
    color: '#00ff41',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  removeButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00ff41',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff41',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  solanaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 6,
  },
  solanaInfoText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
});