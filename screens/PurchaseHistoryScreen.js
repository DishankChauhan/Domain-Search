import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSolana } from '../context/SolanaContext';

export default function PurchaseHistoryScreen({ navigation }) {
  const { 
    transactions, 
    getPurchasedDomains, 
    openTransactionInExplorer, 
    formatAddress,
    isConnected,
    walletAddress 
  } = useSolana();
  
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'domains'
  const [purchasedDomains, setPurchasedDomains] = useState([]);

  useEffect(() => {
    setPurchasedDomains(getPurchasedDomains());
  }, [transactions]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTransactionPress = async (transaction) => {
    Alert.alert(
      'Transaction Details',
      `Transaction ID: ${transaction.signature}\n\nAmount: ${transaction.amount.toFixed(4)} SOL ($${transaction.amountUSD.toFixed(2)})\n\nDomains: ${transaction.domains.length}\n\nDate: ${formatDate(transaction.timestamp)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View on Explorer', 
          onPress: () => openTransactionInExplorer(transaction.signature)
        }
      ]
    );
  };

  const getTotalSpent = () => {
    return transactions.reduce((total, tx) => total + tx.amountUSD, 0);
  };

  const getTotalSOLSpent = () => {
    return transactions.reduce((total, tx) => total + tx.amount, 0);
  };

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase History</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color="#888" />
          <Text style={styles.emptyTitle}>Wallet Not Connected</Text>
          <Text style={styles.emptySubtitle}>
            Connect your Solana wallet to view purchase history
          </Text>
          
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Ionicons name="link" size={20} color="#000" />
            <Text style={styles.connectButtonText}>Go to Checkout</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Purchase History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Wallet Info */}
      <View style={styles.walletInfo}>
        <View style={styles.walletHeader}>
          <Ionicons name="wallet" size={20} color="#00ff41" />
          <Text style={styles.walletAddress}>{formatAddress(walletAddress)}</Text>
        </View>
        
        {transactions.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{purchasedDomains.length}</Text>
              <Text style={styles.statLabel}>Domains</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValueSOL}>{getTotalSOLSpent().toFixed(4)} SOL</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        )}
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#888" />
          <Text style={styles.emptyTitle}>No Purchases Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start shopping to see your purchase history here
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
        <>
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
              onPress={() => setActiveTab('transactions')}
            >
              <Ionicons 
                name="receipt-outline" 
                size={18} 
                color={activeTab === 'transactions' ? '#000' : '#888'} 
              />
              <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
                Transactions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'domains' && styles.activeTab]}
              onPress={() => setActiveTab('domains')}
            >
              <Ionicons 
                name="globe-outline" 
                size={18} 
                color={activeTab === 'domains' ? '#000' : '#888'} 
              />
              <Text style={[styles.tabText, activeTab === 'domains' && styles.activeTabText]}>
                My Domains
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'transactions' ? (
              // Transactions List
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Transaction History ({transactions.length})
                </Text>
                
                {transactions.map((transaction, index) => (
                  <TouchableOpacity
                    key={transaction.id}
                    style={styles.transactionCard}
                    onPress={() => handleTransactionPress(transaction)}
                  >
                    <View style={styles.transactionHeader}>
                      <View style={styles.transactionIcon}>
                        <Ionicons name="checkmark-circle" size={20} color="#00ff41" />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionId}>
                          {formatAddress(transaction.signature)}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatDate(transaction.timestamp)}
                        </Text>
                      </View>
                      <View style={styles.transactionAmount}>
                        <Text style={styles.amountSOL}>
                          {transaction.amount.toFixed(4)} SOL
                        </Text>
                        <Text style={styles.amountUSD}>
                          ${transaction.amountUSD.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.transactionDetails}>
                      <Text style={styles.domainsCount}>
                        {transaction.domains.length} domain{transaction.domains.length > 1 ? 's' : ''} purchased
                      </Text>
                      <View style={styles.statusBadge}>
                        <Ionicons name="shield-checkmark" size={12} color="#000" />
                        <Text style={styles.statusText}>Confirmed</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Domains List
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  My Domains ({purchasedDomains.length})
                </Text>
                
                {purchasedDomains.map((domain, index) => (
                  <View key={`${domain.id}-${index}`} style={styles.domainCard}>
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
                      <View style={styles.domainActions}>
                        <Text style={styles.domainPrice}>${domain.price}</Text>
                        <View style={styles.ownedBadge}>
                          <Ionicons name="shield-checkmark" size={14} color="#000" />
                          <Text style={styles.ownedText}>Owned</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
  walletInfo: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 24,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  walletAddress: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValueSOL: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#00ff41',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  transactionCard: {
    backgroundColor: '#2a2a2a',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  transactionDate: {
    color: '#888',
    fontSize: 12,
  },
  transactionAmount: {
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
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainsCount: {
    color: '#888',
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff41',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
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
  domainActions: {
    alignItems: 'flex-end',
  },
  domainPrice: {
    color: '#00ff41',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff41',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ownedText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
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
    lineHeight: 22,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff41',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  shopButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff41',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  connectButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
}); 