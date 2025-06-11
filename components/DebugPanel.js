import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { useSolana } from '../context/SolanaContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DebugPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const { wallet, balance, connectWallet, requestAirdrop } = useSolana();

  useEffect(() => {
    // Intercept console logs
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      const message = args.join(' ');
      setLogs(prev => [...prev.slice(-50), { 
        type: 'log', 
        message, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      setLogs(prev => [...prev.slice(-50), { 
        type: 'error', 
        message, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = async () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    try {
      await Share.share({
        message: `DomainSwipe Debug Logs:\n\n${logsText}`,
        title: 'Debug Logs'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const testWalletConnection = async () => {
    try {
      console.log('🧪 Testing wallet connection...');
      await connectWallet();
      console.log('✅ Wallet connection test completed');
    } catch (error) {
      console.error('❌ Wallet connection test failed:', error);
    }
  };

  const testAirdrop = async () => {
    try {
      console.log('🧪 Testing airdrop...');
      await requestAirdrop(1);
      console.log('✅ Airdrop test completed');
    } catch (error) {
      console.error('❌ Airdrop test failed:', error);
    }
  };

  const checkStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('📦 AsyncStorage keys:', keys);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`📦 ${key}:`, value);
      }
    } catch (error) {
      console.error('❌ Failed to check storage:', error);
    }
  };

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.toggleText}>DEBUG</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Panel</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsVisible(false)}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.statusText}>
          Wallet: {wallet ? '✅ Connected' : '❌ Disconnected'}
        </Text>
        <Text style={styles.statusText}>
          Balance: {balance.toFixed(4)} SOL
        </Text>
        <Text style={styles.statusText}>
          Public Key: {wallet?.publicKey ? `${wallet.publicKey.slice(0, 8)}...` : 'None'}
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.testButton} onPress={testWalletConnection}>
          <Text style={styles.buttonText}>Test Wallet Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={testAirdrop}>
          <Text style={styles.buttonText}>Test Airdrop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={checkStorage}>
          <Text style={styles.buttonText}>Check Storage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsSection}>
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>Logs ({logs.length})</Text>
          <View style={styles.logButtons}>
            <TouchableOpacity style={styles.logButton} onPress={clearLogs}>
              <Text style={styles.logButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logButton} onPress={exportLogs}>
              <Text style={styles.logButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.logsContainer}>
          {logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Text style={[
                styles.logText,
                log.type === 'error' ? styles.errorLog : styles.normalLog
              ]}>
                [{log.timestamp}] {log.message}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = {
  toggleButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#ff6b35',
    padding: 8,
    borderRadius: 5,
    zIndex: 1000,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    position: 'absolute',
    top: 80,
    left: 10,
    right: 10,
    bottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 10,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#ff6b35',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  buttonSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  testButton: {
    backgroundColor: '#ff6b35',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logsSection: {
    flex: 1,
    padding: 15,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logButtons: {
    flexDirection: 'row',
  },
  logButton: {
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 3,
    marginLeft: 5,
  },
  logButtonText: {
    color: 'white',
    fontSize: 12,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 5,
    padding: 10,
  },
  logItem: {
    marginBottom: 5,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  normalLog: {
    color: '#ccc',
  },
  errorLog: {
    color: '#ff6b6b',
  },
};

export default DebugPanel; 