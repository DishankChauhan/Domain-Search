import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useSolana } from '../context/SolanaContext';

export default function CheckoutScreen({ navigation }) {
  const { items, total, clearCart } = useCart();
  const { 
    wallet, 
    balance, 
    isConnecting,
    solPrice,
    getAvailableWallets,
    connectWallet, 
    processPayment,
    requestAirdrop,
    updateBalance,
    getSOLPrice,
    convertUSDToSOL,
    isConnected
  } = useSolana();

  // Platform detection - more reliable for mobile vs web
  const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

  const [isProcessing, setIsProcessing] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [currentSOLPrice, setCurrentSOLPrice] = useState(0);
  const [showWalletSelection, setShowWalletSelection] = useState(false);

  useEffect(() => {
    initializeCheckout();
  }, []);

  useEffect(() => {
    if (wallet) {
      updateBalance();
      setShowWalletSelection(false);
    }
  }, [wallet]);

  const initializeCheckout = async () => {
    try {
      // Get available wallets
      const wallets = await getAvailableWallets();
      setAvailableWallets(wallets);
      
      // Get current SOL price
      const price = getSOLPrice();
      setCurrentSOLPrice(price);
      
      // If no wallet connected, show wallet selection
      if (!isConnected()) {
        setShowWalletSelection(true);
      }
    } catch (error) {
      console.error('Error initializing checkout:', error);
    }
  };

  const handleWalletConnect = async (walletType) => {
    try {
      const connectedWallet = await connectWallet(walletType);
      if (connectedWallet) {
        Alert.alert(
          'Wallet Connected!',
          `Successfully connected to ${walletType} wallet`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        `Failed to connect to ${walletType} wallet. Make sure the wallet is installed and try again.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleRequestAirdrop = async () => {
    try {
      if (typeof window !== 'undefined') {
        const shouldRequest = window.confirm(
          'Request 2 SOL for testing purposes (Devnet only)?'
        );
        if (shouldRequest) {
          try {
            await requestAirdrop(2);
            window.alert('2 SOL has been added to your wallet!');
          } catch (error) {
            window.alert('Failed to request SOL airdrop. Please try again.');
          }
        }
      } else {
        Alert.alert(
          'Request Test SOL',
          'This will add 2 SOL to your wallet for testing purposes (Devnet only)',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Request Airdrop', 
              onPress: async () => {
                try {
                  await requestAirdrop(2);
                  Alert.alert(
                    'Success',
                    '2 SOL has been added to your wallet!',
                    [{ text: 'OK', style: 'default' }]
                  );
                } catch (error) {
                  Alert.alert(
                    'Airdrop Failed',
                    'Failed to request SOL airdrop. Please try again.',
                    [{ text: 'OK', style: 'default' }]
                  );
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Airdrop error:', error);
    }
  };

  const handlePayment = async () => {
    if (!wallet) {
      if (typeof window !== 'undefined') {
        window.alert('Please connect your wallet to continue');
      } else {
        Alert.alert(
          'Wallet Required',
          'Please connect your wallet to continue',
          [{ text: 'OK', style: 'default' }]
        );
      }
      return;
    }

    const solAmount = convertUSDToSOL(total);
    
    if (balance < solAmount) {
      if (typeof window !== 'undefined') {
        const shouldRequestAirdrop = window.confirm(
          `You need ${solAmount.toFixed(4)} SOL but only have ${balance.toFixed(4)} SOL.\n\nWould you like to request test SOL?`
        );
        if (shouldRequestAirdrop) {
          handleRequestAirdrop();
        }
      } else {
        Alert.alert(
          'Insufficient Balance',
          `You need ${solAmount.toFixed(4)} SOL but only have ${balance.toFixed(4)} SOL`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Get Test SOL', onPress: handleRequestAirdrop }
          ]
        );
      }
      return;
    }

    // Use web-compatible confirmation dialog
    if (typeof window !== 'undefined') {
      const shouldPay = window.confirm(
        `Pay ${solAmount.toFixed(4)} SOL ($${total.toFixed(2)}) for ${items.length} domain(s)?`
      );
      if (shouldPay) {
        processPaymentTransaction();
      }
    } else {
      Alert.alert(
        'Confirm Payment',
        `Pay ${solAmount.toFixed(4)} SOL ($${total.toFixed(2)}) for ${items.length} domain(s)?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Pay Now', 
            onPress: processPaymentTransaction
          }
        ]
      );
    }
  };

  const processPaymentTransaction = async () => {
    setIsProcessing(true);
    try {
      const transaction = await processPayment(items, total);
      
      // Clear cart
      clearCart();
      
      // Navigate to success screen
      navigation.replace('OrderSuccess', { transaction });
      
    } catch (error) {
      console.error('Payment failed:', error);
      if (typeof window !== 'undefined') {
        window.alert(`Payment Failed: ${error.message || 'Transaction failed. Please try again.'}`);
      } else {
        Alert.alert(
          'Payment Failed',
          error.message || 'Transaction failed. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const solAmount = convertUSDToSOL(total);
  const hasInsufficientBalance = wallet && balance < solAmount;

  if (showWalletSelection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect Wallet</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isWeb ? { minHeight: '100%' } : { paddingBottom: 20 }}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.walletSelectionContainer}>
            <View style={styles.walletHeader}>
              <Ionicons name="wallet-outline" size={60} color="#00ff41" />
              <Text style={styles.walletTitle}>Choose Your Wallet</Text>
              <Text style={styles.walletSubtitle}>
                Connect your Solana wallet to complete the purchase
              </Text>
            </View>

            <View style={styles.walletsContainer}>
              {availableWallets.map((walletOption) => (
                <TouchableOpacity
                  key={walletOption.id}
                  style={styles.walletOption}
                  onPress={() => handleWalletConnect(walletOption.id)}
                  disabled={isConnecting}
                >
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>{walletOption.name}</Text>
                    <Text style={[
                      styles.walletStatus,
                      { color: '#00ff41' }
                    ]}>
                      Mobile Wallet Adapter
                    </Text>
                  </View>
                  
                  {isConnecting ? (
                    <ActivityIndicator size="small" color="#00ff41" />
                  ) : (
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color="#00ff41" 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color="#00ff41" />
              <Text style={styles.infoText}>
                This uses Solana Mobile Wallet Adapter to connect to any compatible Solana wallet (Phantom, Solflare, etc.) directly from Expo Go. Transactions are real on Solana Devnet.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isWeb ? { minHeight: '100%' } : { paddingBottom: 20 }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Domains:</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
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
              <Text style={styles.summaryTotalSOL}>
                {solAmount.toFixed(4)} SOL
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Info */}
        {wallet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Wallet</Text>
            
            <View style={styles.walletCard}>
              <View style={styles.walletInfoRow}>
                <View style={styles.walletDetails}>
                  <Text style={styles.walletType}>{wallet.walletType.toUpperCase()}</Text>
                  <Text style={styles.walletAddress}>
                    {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-8)}
                  </Text>
                </View>
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceAmount}>{balance.toFixed(4)} SOL</Text>
                  <Text style={styles.balanceUSD}>
                    ≈ ${(balance * currentSOLPrice).toFixed(2)}
                  </Text>
                </View>
              </View>
              
              {hasInsufficientBalance && (
                <TouchableOpacity
                  style={styles.airdropButton}
                  onPress={handleRequestAirdrop}
                >
                  <Ionicons name="flash-outline" size={16} color="#000" />
                  <Text style={styles.airdropButtonText}>Get Test SOL</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Domain List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Domains ({items.length})</Text>
          
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
              <Text style={styles.domainPrice}>${domain.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!wallet || hasInsufficientBalance || isProcessing) && styles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={!wallet || hasInsufficientBalance || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#000" />
              <Text style={styles.payButtonText}>
                {!wallet ? 'Connect Wallet' : 
                 hasInsufficientBalance ? 'Insufficient Balance' : 
                 `Pay ${solAmount.toFixed(4)} SOL`}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
      display: 'flex',
      flexDirection: 'column',
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
    ...(Platform.OS === 'web' && {
      flexShrink: 0,
    }),
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      height: 'auto',
      maxHeight: 'calc(100vh - 200px)',
      position: 'relative',
    }),
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
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
  walletCard: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletDetails: {
    flex: 1,
  },
  walletType: {
    color: '#00ff41',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  walletAddress: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    color: '#00ff41',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  balanceUSD: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  airdropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff41',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  airdropButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  domainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
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
  actionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#333',
    ...(Platform.OS === 'web' && {
      flexShrink: 0,
      position: 'sticky',
      bottom: 0,
      backgroundColor: '#0a0a0a',
      zIndex: 10,
    }),
  },
  payButton: {
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
  payButtonDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  payButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  // Wallet Selection Styles
  walletSelectionContainer: {
    flex: 1,
    paddingTop: 40,
  },
  walletHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  walletTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  walletSubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  walletsContainer: {
    marginBottom: 32,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  walletStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,255,65,0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.2)',
    gap: 12,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
}); 