import React, { createContext, useContext, useState, useEffect } from 'react';
import SolanaWalletService from '../services/SolanaWalletService';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [solPrice, setSolPrice] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Initialize connection to Solana devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  useEffect(() => {
    initializeSolana();
  }, []);

  const initializeSolana = async () => {
    try {
      // Get current SOL price
      const currentPrice = SolanaWalletService.getSOLPrice();
      setSolPrice(currentPrice);
      
      // Load transaction history
      const history = await SolanaWalletService.getTransactionHistory();
      setTransactions(history);
    } catch (error) {
      console.error('Failed to initialize Solana:', error);
    }
  };

  // Simplified wallet authorization for compatibility with old APK
  const handleAuthorizeSession = async () => {
    console.log('🔄 Attempting to authorize Mobile Wallet Adapter...');
    
    try {
      const authResult = await transact(async (wallet) => {
        console.log('📞 Starting wallet authorization...');
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identityName: 'DomainSwipe',
          identityUri: 'https://domainswipe.app',
        });
        console.log('✅ Authorization successful:', authResult);
        return authResult;
      });
      
      if (authResult) {
        setWallet({
          ...authResult,
          walletType: 'Mobile Wallet Adapter'
        });
        await loadBalance(authResult.publicKey);
      }
      
      return authResult;
    } catch (error) {
      console.error('❌ Mobile Wallet Adapter authorization failed:', error);
      throw error;
    }
  };

  // Load wallet balance
  const loadBalance = async (publicKeyString = null) => {
    try {
      const pubkey = publicKeyString || wallet?.publicKey;
      if (!pubkey) return 0;
      
      const publicKey = new PublicKey(pubkey);
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      setBalance(solBalance);
      return solBalance;
    } catch (error) {
      console.error('Failed to load balance:', error);
      return 0;
    }
  };

  // Get available wallets
  const getAvailableWallets = async () => {
    return SolanaWalletService.getAvailableWallets();
  };

  // Connect to wallet
  const connectWallet = async (walletType = 'auto') => {
    setIsConnecting(true);
    try {
      console.log('🔄 Connecting to wallet...');
      
      // Use SolanaWalletService which handles web vs mobile properly
      const walletData = await SolanaWalletService.connectWallet(walletType);
      
      setWallet({
        publicKey: walletData.publicKey,
        walletType: walletData.walletType,
        connected: true
      });
      
      await loadBalance(walletData.publicKey);
      
      console.log('✅ Wallet connected:', walletData.publicKey);
      return walletData;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if wallet is connected
  const isConnected = () => {
    return wallet && wallet.publicKey;
  };

  // Request SOL airdrop for testing
  const requestAirdrop = async (amount = 2) => {
    try {
      if (!wallet?.publicKey) {
        throw new Error('No wallet connected');
      }
      
      const publicKey = new PublicKey(wallet.publicKey);
      const signature = await connection.requestAirdrop(
        publicKey, 
        amount * LAMPORTS_PER_SOL
      );
      
      await connection.confirmTransaction(signature, 'confirmed');
      await loadBalance();
      
      return signature;
    } catch (error) {
      console.error('Airdrop failed:', error);
      throw error;
    }
  };

  // Process payment transaction - REAL SOLANA PAYMENTS
  const processPayment = async (items, totalUSD) => {
    if (!wallet?.publicKey) {
      throw new Error('No wallet connected');
    }

    const amountSOL = convertUSDToSOL(totalUSD);
    const merchantWalletAddress = SolanaWalletService.getMerchantWallet();
    
    console.log(`💰 Processing REAL payment of ${amountSOL} SOL ($${totalUSD})`);
    
    try {
      // Use SolanaWalletService which handles web vs mobile payments properly
      const transactionData = await SolanaWalletService.sendPayment(
        merchantWalletAddress,
        amountSOL,
        items
      );
      
      console.log(`✅ Payment confirmed! Signature: ${transactionData.signature}`);

      await loadBalance();

      // Update transaction history
      const updatedHistory = await SolanaWalletService.getTransactionHistory();
      setTransactions(updatedHistory);

      return transactionData;
    } catch (error) {
      console.error('❌ Payment failed:', error);
      throw error;
    }
  };

  // Update wallet balance
  const updateBalance = async () => {
    return await loadBalance();
  };

  // Get SOL price
  const getSOLPrice = () => {
    return SolanaWalletService.getSOLPrice();
  };

  // Convert USD to SOL
  const convertUSDToSOL = (usdAmount) => {
    return SolanaWalletService.convertUSDToSOL(usdAmount);
  };

  // Format wallet address for display
  const formatAddress = (address, chars = 4) => {
    return SolanaWalletService.formatAddress(address, chars);
  };

  // Open transaction in explorer
  const openTransactionInExplorer = (signature) => {
    return SolanaWalletService.openTransactionInExplorer(signature);
  };

  // Get purchased domains
  const getPurchasedDomains = async () => {
    return await SolanaWalletService.getPurchasedDomains();
  };

  const value = {
    wallet,
    balance,
    isConnecting,
    isProcessing,
    solPrice,
    transactions,
    getAvailableWallets,
    connectWallet,
    isConnected,
    requestAirdrop,
    processPayment,
    updateBalance,
    getSOLPrice,
    convertUSDToSOL,
    formatAddress,
    openTransactionInExplorer,
    getPurchasedDomains,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
}; 