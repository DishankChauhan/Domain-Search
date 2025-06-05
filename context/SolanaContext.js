import React, { createContext, useContext, useState, useEffect } from 'react';
import SolanaWalletService from '../services/SolanaWalletService';

const SolanaContext = createContext();

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};

export const SolanaProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [solPrice, setSolPrice] = useState(0);

  useEffect(() => {
    initializeService();
  }, []);

  // Initialize the service and restore any existing connection
  const initializeService = async () => {
    try {
      // Restore wallet connection if exists
      const restoredWallet = await SolanaWalletService.restoreConnection();
      if (restoredWallet) {
        setWallet(restoredWallet);
        await updateBalance();
      }
      
      // Get initial SOL price
      const price = SolanaWalletService.getSOLPrice();
      setSolPrice(price);
      
      // Load transaction history
      const history = await SolanaWalletService.getTransactionHistory();
      setTransactions(history);
    } catch (error) {
      console.error('Failed to initialize Solana service:', error);
    }
  };

  // Get available wallets (Phantom, Solflare)
  const getAvailableWallets = async () => {
    try {
      return await SolanaWalletService.getAvailableWallets();
    } catch (error) {
      console.error('Failed to get available wallets:', error);
      return [];
    }
  };

  // Connect to a specific wallet
  const connectWallet = async (walletType = 'phantom') => {
    setIsConnecting(true);
    try {
      const connectedWallet = await SolanaWalletService.connectWallet(walletType);
      if (connectedWallet) {
        setWallet(connectedWallet);
        await updateBalance();
        
        // Refresh transaction history
        const history = await SolanaWalletService.getTransactionHistory();
        setTransactions(history);
        
        return connectedWallet;
      }
      return null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      await SolanaWalletService.disconnect();
      setWallet(null);
      setBalance(0);
      return true;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      return false;
    }
  };

  // Update wallet balance
  const updateBalance = async () => {
    try {
      if (wallet?.publicKey) {
        const newBalance = await SolanaWalletService.getBalance(wallet.publicKey);
        setBalance(newBalance);
        return newBalance;
      }
      return 0;
    } catch (error) {
      console.error('Failed to update balance:', error);
      return 0;
    }
  };

  // Request SOL airdrop (devnet only)
  const requestAirdrop = async (amount = 2) => {
    try {
      if (!wallet) throw new Error('No wallet connected');
      
      const result = await SolanaWalletService.requestAirdrop(wallet.publicKey, amount);
      
      if (result.success) {
        // Update balance after airdrop
        setTimeout(async () => {
          await updateBalance();
        }, 2000); // Wait 2 seconds for transaction to process
      }
      
      return result;
    } catch (error) {
      console.error('Airdrop failed:', error);
      throw error;
    }
  };

  // Process payment
  const processPayment = async (domains, usdAmount) => {
    try {
      if (!wallet) throw new Error('No wallet connected');
      
      // Get current SOL price
      const currentPrice = SolanaWalletService.getSOLPrice();
      setSolPrice(currentPrice);
      
      // Convert USD to SOL
      const solAmount = SolanaWalletService.convertUSDToSOL(usdAmount);
      
      // Check if user has sufficient balance
      const currentBalance = await updateBalance();
      if (currentBalance < solAmount) {
        throw new Error('Insufficient SOL balance');
      }
      
      // Send payment to the merchant wallet
      const merchantWallet = SolanaWalletService.getMerchantWallet();
      
      const transaction = await SolanaWalletService.sendPayment(
        merchantWallet,
        solAmount,
        domains
      );
      
      // Update local state
      await updateBalance();
      const updatedHistory = await SolanaWalletService.getTransactionHistory();
      setTransactions(updatedHistory);
      
      return transaction;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  };

  // Get transaction history
  const getTransactionHistory = async () => {
    try {
      const history = await SolanaWalletService.getTransactionHistory();
      setTransactions(history);
      return history;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  };

  // Get purchased domains
  const getPurchasedDomains = async () => {
    try {
      return await SolanaWalletService.getPurchasedDomains();
    } catch (error) {
      console.error('Failed to get purchased domains:', error);
      return [];
    }
  };

  // Open transaction in explorer
  const openTransactionInExplorer = async (signature) => {
    try {
      return await SolanaWalletService.openTransactionInExplorer(signature);
    } catch (error) {
      console.error('Failed to open transaction in explorer:', error);
      throw error;
    }
  };

  // Format wallet address
  const formatAddress = (address, chars = 4) => {
    return SolanaWalletService.formatAddress(address, chars);
  };

  // Get current SOL price
  const getSOLPrice = () => {
    return SolanaWalletService.getSOLPrice();
  };

  // Convert USD to SOL
  const convertUSDToSOL = (usdAmount) => {
    return SolanaWalletService.convertUSDToSOL(usdAmount);
  };

  // Check if wallet is connected
  const isConnected = () => {
    return SolanaWalletService.isConnected();
  };

  const value = {
    // Wallet state
    wallet,
    balance,
    isConnecting,
    transactions,
    solPrice,
    
    // Wallet operations
    getAvailableWallets,
    connectWallet,
    disconnectWallet,
    updateBalance,
    
    // Transaction operations
    processPayment,
    requestAirdrop,
    getTransactionHistory,
    getPurchasedDomains,
    openTransactionInExplorer,
    
    // Utility functions
    formatAddress,
    getSOLPrice,
    convertUSDToSOL,
    isConnected,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
}; 