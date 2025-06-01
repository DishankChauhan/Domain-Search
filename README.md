# 🌐 Domain Search - Tinder for Domain Names

> **Swipe right to find your perfect domain!**

A modern React Native app that gamifies domain name discovery with a Tinder-like swipe interface. Find and collect premium domain names with an engaging, addictive user experience.

## 📱 Features

### 🎯 **Core Functionality**
- **Smart Search**: Enter any keyword and get AI-generated domain variations
- **Tinder-Style Swiping**: Swipe left to skip, swipe right to add to cart
- **Infinite Discovery**: Continuous domain generation - never run out of options
- **Cart Management**: Persistent storage of favorite domains across sessions
- **Haptic Feedback**: Satisfying vibrations on domain additions

### 🎨 **Design Highlights**
- **Neon Cyberpunk Theme**: Sleek dark UI with neon green (#00ff41) accents
- **Professional Card Design**: Clean, modern domain cards with gradient backgrounds
- **Smooth Animations**: Fluid swipe gestures and transitions
- **Responsive Layout**: Optimized for all mobile screen sizes

### 🚀 **Technical Features**
- **React Native + Expo**: Cross-platform mobile development
- **Persistent Storage**: AsyncStorage for cart data
- **Smart Domain Generation**: Advanced algorithm for creative domain suggestions
- **Gesture Recognition**: Custom PanResponder implementation
- **Real-time Updates**: Dynamic cart badge and statistics

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage for persistence
- **Gestures**: Custom PanResponder for swipe detection
- **Icons**: Expo Vector Icons
- **Gradients**: Expo Linear Gradient
- **Animations**: React Native Animated API

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Setup
```bash
# Clone the repository
git clone https://github.com/DishankChauhan/Domain-Search.git
cd Domain-Search

# Install dependencies
npm install

# Start the development server
expo start

# Scan QR code with Expo Go app
```

### Network Connectivity
For cellular network usage, run with tunnel mode:
```bash
expo start --tunnel
```

## 🎮 How to Use

1. **Search**: Enter a keyword (e.g., "app", "store", "tech")
2. **Swipe**: 
   - 👈 **Left**: Skip domain
   - 👉 **Right**: Add to cart (with haptic feedback)
3. **Explore**: Keep swiping for infinite domain suggestions
4. **Manage**: View and manage saved domains in your cart

## 🏗️ Project Structure

```
Domain-Search/
├── components/
│   └── SwipeCard.js          # Main swipe card component
├── screens/
│   ├── SearchScreen.js       # Keyword search interface
│   ├── SwipeScreen.js        # Main swiping interface
│   └── CartScreen.js         # Saved domains management
├── context/
│   └── CartContext.js        # Global cart state management
├── data/
│   └── mockDomains.js        # Domain generation algorithms
├── assets/                   # App icons and images
├── App.js                    # Main app navigation
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary**: Neon Green (`#00ff41`)
- **Background**: Deep Black (`#0a0a0a`)
- **Card**: Dark Gray (`#1a1a1a`)
- **Text**: White (`#ffffff`)
- **Secondary**: Gray (`#888888`)

### Typography
- **Headings**: Bold, letter-spaced
- **Body**: Clean, readable fonts
- **Accents**: Neon glow effects

## 🚀 Features in Development

- [ ] Domain availability checking via API
- [ ] Price comparison from multiple registrars
- [ ] User accounts and favorites sync
- [ ] Domain categories and filtering
- [ ] Social sharing of domain discoveries
- [ ] Advanced search filters
- [ ] Bulk domain operations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📱 Screenshots

*Screenshots coming soon - app in active development!*

## 🐛 Known Issues

- Requires tunnel mode for cellular connectivity
- Limited to Expo SDK 53 compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dishank Chauhan**
- GitHub: [@DishankChauhan](https://github.com/DishankChauhan)
- Project: [Domain-Search](https://github.com/DishankChauhan/Domain-Search)

## 🙏 Acknowledgments

- Inspired by modern dating app UX patterns
- Built with React Native and Expo
- Neon design inspired by cyberpunk aesthetics

---

⭐ **Star this repository if you found it helpful!**

*Built with ❤️ using React Native* 