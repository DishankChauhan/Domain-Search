import React, { useRef } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.65;
const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ domain, onSwipeLeft, onSwipeRight }) {
  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !domain.checkingAvailability,
      onMoveShouldSetPanResponder: () => !domain.checkingAvailability,
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

  const renderLoadingCard = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00ff41" />
      <Text style={styles.loadingText}>Checking availability...</Text>
      <Text style={styles.loadingDomain}>{domain.name}</Text>
    </View>
  );

  const renderAvailabilityBadge = () => {
    if (domain.checkingAvailability) {
      return (
        <View style={[styles.statusBadge, styles.checkingBadge]}>
          <ActivityIndicator size="small" color="#ffa500" />
          <Text style={styles.checkingText}>Checking...</Text>
        </View>
      );
    }

    return (
      <View style={[styles.statusBadge, domain.available ? styles.availableBadge : styles.unavailableBadge]}>
        <View style={[styles.statusDot, domain.available ? styles.availableDot : styles.unavailableDot]} />
        <Text style={[styles.statusText, domain.available ? styles.availableText : styles.unavailableText]}>
          {domain.available ? 'Available' : 'Taken'}
        </Text>
      </View>
    );
  };

  const renderPremiumBadge = () => {
    if (domain.premium) {
      return (
        <View style={styles.premiumBadge}>
          <Ionicons name="diamond" size={12} color="#ffd700" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      );
    }
    return null;
  };

  const renderAlternativeBadge = () => {
    if (domain.isAlternative) {
      return (
        <View style={styles.alternativeBadge}>
          <Ionicons name="bulb" size={12} color="#00ff41" />
          <Text style={styles.alternativeText}>Suggested</Text>
        </View>
      );
    }
    return null;
  };

  const renderRegistrarInfo = () => {
    if (domain.registrar && !domain.checkingAvailability) {
      return (
        <View style={styles.registrarSection}>
          <Text style={styles.registrarLabel}>Registrar</Text>
          <Text style={styles.registrarName}>{domain.registrar}</Text>
        </View>
      );
    }
    return null;
  };

  const renderPricing = () => {
    if (domain.checkingAvailability) {
      return (
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price</Text>
          <View style={styles.priceLoadingContainer}>
            <ActivityIndicator size="small" color="#00ff41" />
            <Text style={styles.priceLoading}>Loading...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={[styles.price, domain.premium && styles.premiumPrice]}>
          ${domain.price}
          {domain.premium && (
            <Text style={styles.priceNote}> /yr</Text>
          )}
        </Text>
      </View>
    );
  };

  if (domain.checkingAvailability) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0,255,65,0.05)', 'transparent', 'rgba(0,255,65,0.05)']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={[styles.card, styles.loadingCard]}>
          {renderLoadingCard()}
        </View>
      </View>
    );
  }

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
          {/* Domain Header with Badges */}
          <View style={styles.domainHeader}>
            <Text style={styles.domainName} numberOfLines={2} adjustsFontSizeToFit>
              {domain.name}
            </Text>
            <View style={styles.badgeRow}>
              {renderPremiumBadge()}
              {renderAlternativeBadge()}
            </View>
          </View>

          {/* Extension Badge */}
          <View style={styles.extensionContainer}>
            <View style={styles.extensionBadge}>
              <Text style={styles.extensionText}>{domain.extension}</Text>
            </View>
          </View>

          {/* Alternative Info */}
          {domain.isAlternative && domain.originalRequest && (
            <View style={styles.alternativeInfo}>
              <Text style={styles.alternativeInfoText}>
                "{domain.originalRequest}" was taken, here's a great alternative!
              </Text>
            </View>
          )}

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Price Section */}
          {renderPricing()}

          {/* Category Section */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Category</Text>
            <Text style={styles.category}>{domain.category}</Text>
          </View>

          {/* Registrar Info */}
          {renderRegistrarInfo()}

          {/* Availability Status */}
          <View style={styles.statusSection}>
            {renderAvailabilityBadge()}
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
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#00ff41',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  loadingDomain: {
    color: '#888',
    fontSize: 16,
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    left: 50,
    backgroundColor: 'rgba(0, 255, 65, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '-30deg' }],
  },
  nopeOverlay: {
    position: 'absolute',
    top: 50,
    right: 50,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '30deg' }],
  },
  likeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nopeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  domainHeader: {
    marginBottom: 20,
  },
  domainName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alternativeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  alternativeText: {
    color: '#00ff41',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alternativeInfo: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff41',
  },
  alternativeInfoText: {
    color: '#00ff41',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  extensionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  extensionBadge: {
    backgroundColor: '#00ff41',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  extensionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    flex: 1,
  },
  priceSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  priceLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  price: {
    color: '#00ff41',
    fontSize: 32,
    fontWeight: 'bold',
  },
  premiumPrice: {
    color: '#ffd700',
  },
  priceNote: {
    fontSize: 16,
    color: '#888',
  },
  priceLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceLoading: {
    color: '#888',
    fontSize: 16,
  },
  categorySection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  category: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  registrarSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  registrarLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  registrarName: {
    color: '#fff',
    fontSize: 16,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  availableBadge: {
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  checkingBadge: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availableDot: {
    backgroundColor: '#00ff41',
  },
  unavailableDot: {
    backgroundColor: '#ff3b30',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  availableText: {
    color: '#00ff41',
  },
  unavailableText: {
    color: '#ff3b30',
  },
  checkingText: {
    color: '#ffa500',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
}); 