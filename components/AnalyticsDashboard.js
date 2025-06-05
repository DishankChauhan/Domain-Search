import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalSwipes: 0,
    domainsLiked: 0,
    totalPurchases: 0,
    solSpent: 0,
    uniqueDomains: 0,
    sessionsCount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const keys = [
        'totalSwipes',
        'domainsLiked', 
        'totalPurchases',
        'solSpent',
        'uniqueDomains',
        'sessionsCount'
      ];

      const values = await AsyncStorage.multiGet(keys);
      const metricsData = {};

      values.forEach(([key, value]) => {
        metricsData[key] = value ? parseFloat(value) : 0;
      });

      setMetrics(metricsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, color = '#00ff41' }) => (
    <View style={[styles.metricCard, { borderColor: color }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.dashboardTitle}>📊 DomainSwipe Analytics</Text>
      
      <View style={styles.metricsGrid}>
        <MetricCard 
          title="Total Swipes"
          value={metrics.totalSwipes}
          subtitle="Domains evaluated"
        />
        
        <MetricCard 
          title="Domains Liked"
          value={metrics.domainsLiked}
          subtitle="Added to cart"
          color="#ff6b6b"
        />
        
        <MetricCard 
          title="Purchases"
          value={metrics.totalPurchases}
          subtitle="Completed orders"
          color="#4ecdc4"
        />
        
        <MetricCard 
          title="SOL Spent"
          value={metrics.solSpent.toFixed(4)}
          subtitle="Total volume"
          color="#9945ff"
        />
        
        <MetricCard 
          title="Success Rate"
          value={`${metrics.totalSwipes > 0 ? ((metrics.domainsLiked / metrics.totalSwipes) * 100).toFixed(1) : 0}%`}
          subtitle="Like rate"
          color="#feca57"
        />
        
        <MetricCard 
          title="Sessions"
          value={metrics.sessionsCount}
          subtitle="App opens"
          color="#ff9ff3"
        />
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>💡 Insights</Text>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            🎯 You've discovered {metrics.uniqueDomains} unique domains through swiping
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            ⚡ Average transaction cost: ~$0.0001 (Solana devnet)
          </Text>
        </View>
        
        {metrics.solSpent > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              💰 Total saved in fees vs traditional payments: ~${(metrics.totalPurchases * 2.9).toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a'
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    alignItems: 'center'
  },
  metricTitle: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  metricSubtitle: {
    color: '#666666',
    fontSize: 10,
    textAlign: 'center'
  },
  insightsSection: {
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    letterSpacing: 1
  },
  insightCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff41'
  },
  insightText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20
  }
});

export default AnalyticsDashboard; 