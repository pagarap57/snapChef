# SnapChef

An AI-powered mobile app that transforms your ingredients into delicious recipes using Google Cloud Vision API and machine learning.

![SnapChef Demo](https://img.shields.io/badge/React%20Native-0.72.10-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2049-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.2-38B2AC)

## Features

- **AI-Powered Ingredient Detection**: Uses Google Cloud Vision API to automatically identify ingredients from photos
- **Smart Recipe Generation**: Generates personalized recipes based on detected ingredients
- **Multi-Modal Analysis**: Combines label detection, object localization, and text recognition for accurate results
- **Confidence Scoring**: Each detected ingredient includes confidence levels for transparency
- **Cross-Platform**: Built with React Native for iOS and Android compatibility
- **Modern UI**: Beautiful, intuitive interface built with TailwindCSS
- **Demo Mode**: Works out-of-the-box for testing without API setup

## How It Works

1. **Snap Photos**: Take clear photos of your ingredients or select from gallery
2. **AI Analysis**: Google Cloud Vision API analyzes images to detect food items
3. **Smart Processing**: AI filters and categorizes detected items as ingredients
4. **Recipe Generation**: Get personalized recipe suggestions based on your ingredients
5. **Detailed Results**: View recipes with cooking times, missing ingredients, and confidence scores

## Tech Stack

- **Frontend**: React Native with Expo
- **Styling**: TailwindCSS with NativeWind
- **AI Services**: Google Cloud Vision API
- **Recipe API**: Spoonacular API (with fallback system)
- **State Management**: React Hooks
- **Navigation**: React Navigation

## Screenshots

- **Home Screen**: Camera and gallery integration with ingredient analysis
- **Review Screen**: Display detected ingredients with confidence scores
- **Results Screen**: Categorized recipes with detailed information

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pagarap57/snapChef.git
   cd snapChef
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go app

## API Setup

### Google Cloud Vision API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Cloud Vision API
3. Create API credentials
4. Copy the API key to `.env` file:
   ```env
   EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
   ```

### Spoonacular API (Optional)

1. Sign up at [Spoonacular](https://spoonacular.com/food-api)
2. Get your API key
3. Add to `.env` for enhanced recipe data:
   ```env
   EXPO_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_key_here
   ```

## 📖 Usage

1. **Take Photos**: Use the camera or select images from your gallery
2. **Automatic Analysis**: Images are analyzed automatically with AI
3. **Review Ingredients**: Check detected ingredients and confidence scores
4. **Generate Recipes**: Get personalized recipe suggestions
5. **View Results**: Browse categorized recipes with detailed information

## 🎯 AI Capabilities

- **Label Detection**: Identifies food items and ingredients
- **Object Localization**: Precise detection of food objects in images
- **Text Recognition**: Reads food labels and packaging information
- **Smart Filtering**: Only considers food-related items as ingredients
- **Confidence Scoring**: Provides transparency about detection accuracy

## 🔧 Configuration

The app uses environment variables for API configuration:

```env
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_vision_api_key
EXPO_PUBLIC_SPOONACULAR_API_KEY=your_recipe_api_key
```

**Note**: If no API keys are provided, the app runs in demo mode with mock data.

## 📊 Performance

- **Image Analysis**: Typically 2-5 seconds per image (with real API)
- **Recipe Generation**: 1-3 seconds for recipe suggestions
- **Fallback System**: Instant AI-generated recipes if APIs are unavailable
- **Demo Mode**: Instant results for testing

## 🚧 Development

### Project Structure

```
src/
├── screens/          # App screens
│   ├── HomeScreen.js
│   ├── ImageReviewScreen.js
│   └── ResultsScreen.js
├── services/         # API services
│   ├── visionApi.js
│   └── recipeService.js
└── components/       # Reusable components
```

### Key Services

- **`VisionService`**: Google Cloud Vision API integration with fallback
- **`RecipeService`**: Recipe generation and management

### Running the App

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start --clear

# Build for production
npx expo build:ios
npx expo build:android
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Cloud Vision API for image analysis
- Spoonacular for recipe data
- React Native community for the amazing framework
- Expo team for the development platform

## Support

For support or questions:
- Open an issue in this repository
- Check [Expo documentation](https://docs.expo.dev/)
- Review [React Native docs](https://reactnative.dev/)

## Roadmap

- [ ] User authentication and recipe history
- [ ] Offline recipe storage
- [ ] Recipe rating and reviews
- [ ] Nutritional information
- [ ] Recipe categories and filters
- [ ] Social sharing features
- [ ] Voice commands for hands-free cooking

---

**SnapChef** - Turn your ingredients into culinary inspiration!
 [pagarap57](https://github.com/pagarap57)


