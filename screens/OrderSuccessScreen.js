import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSolana } from '../context/SolanaContext';

export default function OrderSuccessScreen({ navigation, route }) {
  const { transaction } = route.params || {};
  const { openTransactionInExplorer, getPurchasedDomains, formatAddress } = useSolana();
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [purchasedDomains, setPurchasedDomains] = useState([]);

  useEffect(() => {
    // Pulse animation for success icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Load purchased domains
    setPurchasedDomains(getPurchasedDomains());

    return () => pulseAnimation.stop();
  }, []);

  const handleViewTransaction = async () => {
    try {
      await openTransactionInExplorer(transaction.signature);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open transaction in explorer. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleCopyTransactionId = () => {
    // In a real app, you'd copy to clipboard
    Alert.alert(
      'Transaction ID',
      transaction.signature,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleContinueShopping = () => {
    navigation.navigate('Search');
  };

  const handleViewPurchases = () => {
    navigation.navigate('PurchaseHistory');
  };

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={80} color="#ff4444" />
          <Text style={styles.errorTitle}>No Transaction Found</Text>
          <Text style={styles.errorSubtitle}>
            Something went wrong. Please try again.
          </Text>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Animated.View 
            style={[
              styles.successIconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Ionicons name="checkmark-circle" size={80} color="#00ff41" />
          </Animated.View>
          
          <Text style={styles.successTitle}>Payment Successful! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your domains have been purchased successfully
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          <View style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Transaction ID</Text>
              <TouchableOpacity 
                style={styles.transactionIdContainer}
                onPress={handleCopyTransactionId}
              >
                <Text style={styles.transactionId}>
                  {formatAddress(transaction.signature)}
                </Text>
                <Ionicons name="copy-outline" size={16} color="#888" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Amount Paid</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.amountSOL}>
                  {transaction.amount.toFixed(4)} SOL
                </Text>
                <Text style={styles.amountUSD}>
                  ${transaction.amountUSD.toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Status</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
            
            <View style={styles.transactionRow}>
              <Text style={styles.transactionLabel}>Date</Text>
              <Text style={styles.transactionValue}>
                {formatDate(transaction.timestamp)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.explorerButton}
              onPress={handleViewTransaction}
            >
              <Ionicons name="globe-outline" size={16} color="#00ff41" />
              <Text style={styles.explorerButtonText}>View on Solana Explorer</Text>
              <Ionicons name="open-outline" size={16} color="#00ff41" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Purchased Domains */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Purchased Domains ({transaction.domains.length})
          </Text>
          
          {transaction.domains.map((domain, index) => (
            <View key={domain.id} style={styles.domainCard}>
              <View style={styles.domainHeader}>
                <View style={styles.domainInfo}>
                  <Text style={styles.domainName}>{domain.name}</Text>
                  <View style={styles.domainMeta}>
                    <View style={styles.extensionBadge}>
                      <Text style={styles.extensionText}>{domain.extension}</Text>
                    </View>
                    <Text style={styles.domainCategory}>{domain.category}</Text>
                  </View>
                </View>
                <Text style={styles.domainPrice}>${domain.price}</Text>
              </View>
              
              <View style={styles.domainStatus}>
                <View style={styles.ownedBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#000" />
                  <Text style={styles.ownedText}>Owned</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* All Purchased Domains Summary */}
        {purchasedDomains.length > transaction.domains.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Total Domains Owned ({purchasedDomains.length})
            </Text>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                You now own a total of {purchasedDomains.length} domains! 
                View your complete purchase history to see all your domains.
              </Text>
              
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handleViewPurchases}
              >
                <Ionicons name="time-outline" size={18} color="#00ff41" />
                <Text style={styles.historyButtonText}>View Purchase History</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.nextStepsCard}>
            <View style={styles.nextStep}>
              <View style={styles.stepIcon}>
                <Ionicons name="settings-outline" size={20} color="#00ff41" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Configure Your Domains</Text>
                <Text style={styles.stepDescription}>
                  Set up DNS, hosting, and other domain settings
                </Text>
              </View>
            </View>
            
            <View style={styles.nextStep}>
              <View style={styles.stepIcon}>
                <Ionicons name="rocket-outline" size={20} color="#00ff41" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Launch Your Project</Text>
                <Text style={styles.stepDescription}>
                  Use your new domains for websites, apps, or email
                </Text>
              </View>
            </View>
            
            <View style={styles.nextStep}>
              <View style={styles.stepIcon}>
                <Ionicons name="repeat-outline" size={20} color="#00ff41" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Discover More Domains</Text>
                <Text style={styles.stepDescription}>
                  Continue swiping to find more perfect domains
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueShopping}
        >
          <Ionicons name="search" size={20} color="#00ff41" />
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.historyButtonAction}
          onPress={handleViewPurchases}
        >
          <Ionicons name="receipt-outline" size={20} color="#000" />
          <Text style={styles.historyButtonActionText}>View All Purchases</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successIconContainer: {
    marginBottom: 20,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  transactionCard: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionLabel: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
  transactionIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionId: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountSOL: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  amountUSD: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff41',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  statusText: {
    color: '#00ff41',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionValue: {
    color: '#fff',
    fontSize: 14,
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,65,0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.3)',
    gap: 6,
    marginTop: 8,
  },
  explorerButtonText: {
    color: '#00ff41',
    fontSize: 14,
    fontWeight: '600',
  },
  domainCard: {
    backgroundColor: '#2a2a2a',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  domainMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  extensionBadge: {
    backgroundColor: '#00ff41',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  },
  domainPrice: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: 'bold',
  },
  domainStatus: {
    alignItems: 'flex-start',
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff41',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  ownedText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  summaryText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,65,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.3)',
    gap: 6,
  },
  historyButtonText: {
    color: '#00ff41',
    fontSize: 14,
    fontWeight: '600',
  },
  nextStepsCard: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,65,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 18,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#0a0a0a',
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
    gap: 8,
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
  },
  historyButtonAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff41',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  historyButtonActionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorSubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#00ff41',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
}); 