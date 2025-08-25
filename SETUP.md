# SnapChef Setup Guide

## Prerequisites

1. **Google Cloud Account** - You'll need a Google Cloud account to use the Vision API
2. **Node.js and npm** - For running the React Native app
3. **Expo CLI** - For development and building

## Setup Steps

### 1. Google Cloud Vision API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Cloud Vision API:
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

### 2. Environment Configuration

1. Copy the environment file:
   ```bash
   cp env.example .env
   ```

2. Add your API keys to `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
   EXPO_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_key_here
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the App

```bash
npx expo start
```

## How It Works

### Image Analysis Flow

1. **Photo Capture**: User takes photos of ingredients using camera or selects from gallery
2. **AI Analysis**: Google Cloud Vision API analyzes images to detect:
   - Food items (label detection)
   - Object localization (precise food detection)
   - Text on packaging (for packaged foods)
3. **Ingredient Processing**: AI filters and categorizes detected items as food ingredients
4. **Recipe Generation**: Recipe service generates personalized recipes based on detected ingredients
5. **Results Display**: User sees categorized recipes with confidence scores and missing ingredients

### AI Features

- **Multi-modal Detection**: Combines label detection, object localization, and text recognition
- **Confidence Scoring**: Each detected ingredient has a confidence score
- **Smart Filtering**: Only food-related items are considered as ingredients
- **Fallback System**: If external APIs fail, generates basic recipe suggestions

### API Integration

- **Google Cloud Vision API**: For image analysis and ingredient detection
- **Spoonacular API** (optional): For enhanced recipe data and instructions
- **Fallback System**: AI-generated recipes when external APIs are unavailable

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your Google Cloud Vision API key is correct and has proper permissions
2. **Image Analysis Failures**: Check image quality - clear, well-lit photos work best
3. **Recipe Generation Issues**: Verify internet connection for external API calls

### Performance Tips

- Use clear, well-lit photos
- Avoid shadows and reflections
- Include multiple angles for complex ingredients
- Ensure ingredients are clearly visible

## Security Notes

- Never commit your `.env` file to version control
- API keys are exposed to the client (this is normal for Expo apps)
- Consider implementing rate limiting for production use
- Monitor API usage to control costs

## Cost Considerations

- Google Cloud Vision API: $1.50 per 1000 images
- Spoonacular API: Free tier available (150 requests/day)
- Monitor usage in Google Cloud Console

## Next Steps

- Implement user authentication
- Add recipe favorites and history
- Integrate with grocery delivery services
- Add nutritional information
- Implement offline recipe storage
