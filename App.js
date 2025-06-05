import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, View, Text, StyleSheet, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './context/CartContext';
import { SolanaProvider } from './context/SolanaContext';
import SearchScreen from './screens/SearchScreen';
import SwipeScreen from './screens/SwipeScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import PurchaseHistoryScreen from './screens/PurchaseHistoryScreen';

const Stack = createStackNavigator();

// Loading Screen Component with Logo.png and 3 Dots
function LoadingScreen() {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const dot1Anim = React.useRef(new Animated.Value(0.3)).current;
  const dot2Anim = React.useRef(new Animated.Value(0.3)).current;
  const dot3Anim = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // 3 Dots animation sequence
    const dotsAnimation = Animated.loop(
      Animated.sequence([
        // Dot 1
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot1Anim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        // Dot 2
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        // Dot 3
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        // Pause
        Animated.delay(400),
      ])
    );

    pulseAnimation.start();
    dotsAnimation.start();

    return () => {
      pulseAnimation.stop();
      dotsAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.loadingContainer}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Image 
          source={require('./assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 3 Dots Loading Animation */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
      </View>
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loader for 2.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <SolanaProvider>
      <CartProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Search"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#0a0a0a' },
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          >
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Swipe" component={SwipeScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
            <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SolanaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    // No margin needed for centered logo only
  },
  logo: {
    width: 200,
    height: 200,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ff41',
    marginHorizontal: 2,
  },
}); 