import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  clusterApiUrl 
} from '@solana/web3.js';
import { 
  transact,
  Web3MobileWallet 
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Your app's merchant wallet on devnet
const MERCHANT_WALLET = '5GpyR3My81ghaFANnJuTbK1qNjnhq8yFr8jXVnow39Rn';

// Check if running in web environment
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

class SolanaWalletService {
  constructor() {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    this.connectedWallet = null;
    this.currentSOLPrice = 0;
    
    // Initialize price fetching
    this.fetchSOLPrice();
    
    // Set up periodic price updates (every 5 minutes)
    setInterval(() => this.fetchSOLPrice(), 5 * 60 * 1000);
  }

  // Fetch real SOL price from CoinGecko API
  async fetchSOLPrice() {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
        { timeout: 10000 }
      );
      this.currentSOLPrice = response.data.solana.usd;
      console.log('Updated SOL price:', this.currentSOLPrice);
      return this.currentSOLPrice;
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
      if (!this.currentSOLPrice) {
        this.currentSOLPrice = 100;
      }
      return this.currentSOLPrice;
    }
  }

  // Get current SOL price
  getSOLPrice() {
    return this.currentSOLPrice || 100;
  }

  // Convert USD to SOL using real exchange rate
  convertUSDToSOL(usdAmount) {
    const solPrice = this.getSOLPrice();
    return usdAmount / solPrice;
  }

  // Get available wallets - different for web vs mobile
  async getAvailableWallets() {
    if (isWeb) {
      // Web browser wallets
      const wallets = [];
      
      // Check for Phantom
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        wallets.push({
          id: 'phantom',
          name: 'Phantom',
          installed: true,
          icon: 'https://phantom.app/img/phantom-logo.svg'
        });
      }
      
      // Check for Solflare
      if (typeof window !== 'undefined' && window.solflare) {
        wallets.push({
          id: 'solflare',
          name: 'Solflare',
          installed: true,
          icon: 'https://solflare.com/img/solflare-logo.svg'
        });
      }
      
      // If no wallets detected, show available options
      if (wallets.length === 0) {
        wallets.push({
          id: 'phantom',
          name: 'Phantom (Install Extension)',
          installed: false,
          url: 'https://phantom.app/'
        });
      }
      
      return wallets;
    } else {
      // Mobile wallets
      return [
        {
          id: 'mobile-wallet-adapter',
          name: 'Solana Wallet',
          installed: true,
          scheme: 'solana-wallet'
        }
      ];
    }
  }

  // Connect to wallet - different for web vs mobile
  async connectWallet(walletType = 'auto') {
    try {
      console.log('Connecting to Solana wallet...');
      
      if (isWeb) {
        return await this.connectWebWallet(walletType);
      } else {
        return await this.connectMobileWallet(walletType);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }

  // Connect to web browser wallet
  async connectWebWallet(walletType) {
    if (typeof window === 'undefined') {
      throw new Error('Web wallets not available in this environment');
    }

    let wallet = null;
    
    // Auto-detect or use specific wallet
    if (walletType === 'phantom' || (walletType === 'auto' && window.solana?.isPhantom)) {
      wallet = window.solana;
    } else if (walletType === 'solflare' || (walletType === 'auto' && window.solflare)) {
      wallet = window.solflare;
    } else if (window.solana) {
      wallet = window.solana;
    } else {
      throw new Error('No Solana wallet found. Please install Phantom or Solflare browser extension.');
    }

    // Connect to wallet
    const response = await wallet.connect();
    
    if (!response.publicKey) {
      throw new Error('Failed to connect to wallet');
    }

    // Store the wallet connection
    this.connectedWallet = {
      publicKey: response.publicKey.toString(),
      wallet: wallet,
      walletType: wallet.isPhantom ? 'phantom' : (wallet.isSolflare ? 'solflare' : 'unknown'),
      connected: true
    };

    // Save to storage (web localStorage)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('connected_wallet', JSON.stringify({
        publicKey: this.connectedWallet.publicKey,
        walletType: this.connectedWallet.walletType
      }));
    }
    
    console.log('Web wallet connected:', this.connectedWallet.publicKey);
    return this.connectedWallet;
  }

  // Connect to mobile wallet via Mobile Wallet Adapter
  async connectMobileWallet(walletType) {
    // Use Mobile Wallet Adapter for real wallet connection
    const result = await transact(async (wallet) => {
      // Request authorization from the wallet
      const authResult = await wallet.authorize({
        cluster: 'devnet',
        identity: {
          name: 'DomainSwipe',
          uri: 'https://domainswipe.app',
          icon: 'https://domainswipe.app/icon.png'
        }
      });

      return {
        publicKey: authResult.accounts[0].address,
        authToken: authResult.auth_token,
        walletUriBase: authResult.wallet_uri_base
      };
    });

    // Store the real wallet connection
    this.connectedWallet = {
      publicKey: result.publicKey,
      authToken: result.authToken,
      walletUriBase: result.walletUriBase,
      walletType: 'mobile-wallet-adapter',
      connected: true
    };

    // Save to storage
    await AsyncStorage.setItem('connected_wallet', JSON.stringify(this.connectedWallet));
    
    console.log('Mobile wallet connected:', this.connectedWallet.publicKey);
    return this.connectedWallet;
  }

  // Get real wallet balance from blockchain
  async getBalance(publicKey = null) {
    try {
      const walletAddress = publicKey || this.connectedWallet?.publicKey;
      if (!walletAddress) throw new Error('No wallet connected');

      const publicKeyObj = new PublicKey(walletAddress);
      const balanceInLamports = await this.connection.getBalance(publicKeyObj);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      
      console.log(`Real balance for ${walletAddress}: ${balanceInSOL} SOL`);
      return balanceInSOL;
    } catch (error) {
      console.error('Error fetching real balance:', error);
      throw error;
    }
  }

  // Request real SOL airdrop from devnet faucet
  async requestAirdrop(publicKeyString = null, amount = 2) {
    try {
      const wallet = publicKeyString || this.connectedWallet?.publicKey;
      if (!wallet) throw new Error('No wallet connected');

      const publicKey = new PublicKey(wallet);
      
      console.log(`Requesting ${amount} SOL airdrop for ${wallet}`);
      
      // Request airdrop from devnet faucet
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      console.log('Airdrop transaction signature:', signature);

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Airdrop transaction failed');
      }
      
      console.log('Airdrop confirmed successfully');
      
      return {
        signature,
        amount,
        success: true
      };
    } catch (error) {
      console.error('Real airdrop error:', error);
      throw error;
    }
  }

  // Create and send REAL payment transaction
  async sendPayment(toAddress, amountSOL, domains) {
    try {
      if (!this.connectedWallet) {
        throw new Error('No wallet connected');
      }

      console.log(`Creating real transaction: ${amountSOL} SOL from ${this.connectedWallet.publicKey} to ${toAddress}`);
      
      if (isWeb) {
        return await this.sendWebPayment(toAddress, amountSOL, domains);
      } else {
        return await this.sendMobilePayment(toAddress, amountSOL, domains);
      }
    } catch (error) {
      console.error('Real payment error:', error);
      throw error;
    }
  }

  // Send payment via web browser wallet
  async sendWebPayment(toAddress, amountSOL, domains) {
    const fromPubkey = new PublicKey(this.connectedWallet.publicKey);
    const toPubkey = new PublicKey(toAddress);
    
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
      })
    );

    // Get recent blockhash
    const { blockhash } = await this.connection.getRecentBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Sign transaction with web wallet
    const signedTransaction = await this.connectedWallet.wallet.signTransaction(transaction);
    
    // Send transaction
    const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
    
    console.log('Web transaction submitted:', signature);
    
    // Wait for confirmation
    await this.connection.confirmTransaction(signature, 'confirmed');
    
    console.log('Web transaction confirmed:', signature);
    
    // Create transaction record
    const transactionData = {
      signature,
      amount: amountSOL,
      amountUSD: amountSOL * this.getSOLPrice(),
      domains,
      from: this.connectedWallet.publicKey,
      to: toAddress,
      timestamp: Date.now(),
      status: 'confirmed',
      walletType: this.connectedWallet.walletType
    };

    await this.saveTransaction(transactionData);
    
    return transactionData;
  }

  // Send payment via Mobile Wallet Adapter
  async sendMobilePayment(toAddress, amountSOL, domains) {
    // Use Mobile Wallet Adapter to sign and send real transaction
    const result = await transact(async (wallet) => {
      // Reauthorize for this transaction
      const authResult = await wallet.reauthorize({
        auth_token: this.connectedWallet.authToken,
        identity: {
          name: 'DomainSwipe',
          uri: 'https://domainswipe.app',
          icon: 'https://domainswipe.app/icon.png'
        }
      });

      const fromPubkey = new PublicKey(authResult.accounts[0].address);
      const toPubkey = new PublicKey(toAddress);
      
      // Create real transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getRecentBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Sign and send transaction via wallet
      const signedTransactions = await wallet.signAndSendTransactions({
        transactions: [transaction]
      });

      return {
        signature: signedTransactions[0],
        publicKey: authResult.accounts[0].address
      };
    });
    
    console.log('Mobile transaction submitted:', result.signature);
    
    // Wait for confirmation
    await this.connection.confirmTransaction(result.signature, 'confirmed');
    
    console.log('Mobile transaction confirmed:', result.signature);
    
    // Create transaction record
    const transactionData = {
      signature: result.signature,
      amount: amountSOL,
      amountUSD: amountSOL * this.getSOLPrice(),
      domains,
      from: result.publicKey,
      to: toAddress,
      timestamp: Date.now(),
      status: 'confirmed',
      walletType: this.connectedWallet.walletType
    };

    await this.saveTransaction(transactionData);
    
    return transactionData;
  }

  // Save transaction to local storage (web/mobile compatible)
  async saveTransaction(transaction) {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        // Web storage
        const existing = localStorage.getItem('transaction_history');
        const history = existing ? JSON.parse(existing) : [];
        history.unshift(transaction);
        localStorage.setItem('transaction_history', JSON.stringify(history));
      } else {
        // Mobile storage
        const existing = await AsyncStorage.getItem('transaction_history');
        const history = existing ? JSON.parse(existing) : [];
        history.unshift(transaction);
        await AsyncStorage.setItem('transaction_history', JSON.stringify(history));
      }
      console.log('Transaction saved to history');
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  // Get transaction history (web/mobile compatible)
  async getTransactionHistory() {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        // Web storage
        const history = localStorage.getItem('transaction_history');
        return history ? JSON.parse(history) : [];
      } else {
        // Mobile storage
        const history = await AsyncStorage.getItem('transaction_history');
        return history ? JSON.parse(history) : [];
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get purchased domains from transaction history
  async getPurchasedDomains() {
    try {
      const history = await this.getTransactionHistory();
      const domains = [];
      
      history.forEach(transaction => {
        if (transaction.domains && transaction.status === 'confirmed') {
          domains.push(...transaction.domains);
        }
      });
      
      return domains;
    } catch (error) {
      console.error('Error fetching purchased domains:', error);
      return [];
    }
  }

  // Disconnect wallet
  async disconnect() {
    try {
      // Deauthorize the wallet if possible
      if (this.connectedWallet?.authToken) {
        try {
          await transact(async (wallet) => {
            await wallet.deauthorize({ auth_token: this.connectedWallet.authToken });
          });
        } catch (error) {
          console.log('Wallet already disconnected or error deauthorizing:', error);
        }
      }

      await AsyncStorage.removeItem('connected_wallet');
      this.connectedWallet = null;
      console.log('Wallet disconnected');
      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return false;
    }
  }

  // Restore wallet connection from storage
  async restoreConnection() {
    try {
      const stored = await AsyncStorage.getItem('connected_wallet');
      if (stored) {
        this.connectedWallet = JSON.parse(stored);
        console.log('Wallet connection restored:', this.connectedWallet.publicKey);
        
        // Verify the connection is still valid by checking balance
        try {
          await this.getBalance();
          return this.connectedWallet;
        } catch (error) {
          console.log('Stored wallet connection is invalid, clearing...');
          await this.disconnect();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error restoring wallet connection:', error);
      return null;
    }
  }

  // Get Solana explorer URL for transaction
  getExplorerURL(signature) {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  }

  // Open transaction in Solana explorer
  async openTransactionInExplorer(signature) {
    const url = this.getExplorerURL(signature);
    return Linking.openURL(url);
  }

  // Format wallet address for display
  formatAddress(address, chars = 4) {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  // Check if wallet is connected
  isConnected() {
    return this.connectedWallet && this.connectedWallet.connected;
  }

  // Get connected wallet info
  getWalletInfo() {
    return this.connectedWallet;
  }

  // Get merchant wallet address for payments
  getMerchantWallet() {
    return MERCHANT_WALLET;
  }
}

export default new SolanaWalletService(); 