import React, { useRef } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.65;
const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ domain, onSwipeLeft, onSwipeRight }) {
  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();

        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right
          forceSwipe('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left
          forceSwipe('left');
        } else {
          // Return to center
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? screenWidth : -screenWidth;
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    if (direction === 'right') {
      onSwipeRight(domain);
    } else {
      onSwipeLeft(domain);
    }
    position.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-screenWidth * 1.5, 0, screenWidth * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
      opacity,
    };
  };

  const getLikeOpacity = () => {
    return position.x.interpolate({
      inputRange: [0, screenWidth / 4],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  };

  const getNopeOpacity = () => {
    return position.x.interpolate({
      inputRange: [-screenWidth / 4, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  };

  return (
    <View style={styles.container}>
      {/* Subtle Gradient Background */}
      <LinearGradient
        colors={['rgba(0,255,65,0.05)', 'transparent', 'rgba(0,255,65,0.05)']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View
        style={[styles.card, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        {/* Swipe Overlays */}
        <Animated.View style={[styles.likeOverlay, { opacity: getLikeOpacity() }]}>
          <Text style={styles.likeText}>ADD TO CART</Text>
        </Animated.View>
        
        <Animated.View style={[styles.nopeOverlay, { opacity: getNopeOpacity() }]}>
          <Text style={styles.nopeText}>SKIP</Text>
        </Animated.View>

        {/* Domain Content */}
        <View style={styles.content}>
          {/* Domain Name */}
          <View style={styles.domainHeader}>
            <Text style={styles.domainName} numberOfLines={2} adjustsFontSizeToFit>
              {domain.name}
            </Text>
          </View>

          {/* Extension Badge */}
          <View style={styles.extensionContainer}>
            <View style={styles.extensionBadge}>
              <Text style={styles.extensionText}>{domain.extension}</Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>${domain.price}</Text>
          </View>

          {/* Category Section */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Category</Text>
            <Text style={styles.category}>{domain.category}</Text>
          </View>

          {/* Status */}
          <View style={styles.statusSection}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Available</Text>
            </View>
          </View>
        </View>

        {/* Very Subtle Swipe Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            👈 Swipe left to skip • Swipe right to add 👉
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  domainHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  domainName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  extensionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  extensionBadge: {
    backgroundColor: '#00ff41',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 5,
  },
  extensionText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceLabel: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  price: {
    color: '#00ff41',
    fontSize: 48,
    fontWeight: '800',
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: -1,
  },
  categorySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  category: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,65,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,65,0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff41',
    marginRight: 8,
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    color: '#00ff41',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  likeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,255,65,0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  likeText: {
    color: '#00ff41',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#00ff41',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    transform: [{ rotate: '15deg' }],
  },
  nopeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  nopeText: {
    color: '#ff4444',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#ff4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    transform: [{ rotate: '-15deg' }],
  },
}); 