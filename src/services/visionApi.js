import axios from 'axios';

// Google Cloud Vision API configuration
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY; // You'll need to set this in your environment

export class VisionService {
  static async analyzeImage(imageUri) {
    try {
      // Check if API key is configured
      if (!API_KEY || API_KEY === 'your_google_cloud_vision_api_key_here') {
        console.log('No API key configured, using fallback mode');
        return this.fallbackAnalysis(imageUri);
      }

      // Convert image to base64
      const base64Image = await this.imageToBase64(imageUri);
      
      // Prepare the request payload
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10
              },
              {
                type: 'TEXT_DETECTION',
                maxResults: 5
              },
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 10
              }
            ]
          }
        ]
      };

      // Make API request
      const response = await axios.post(`${VISION_API_URL}?key=${API_KEY}`, requestBody);
      
      // Process and return the results
      return this.processVisionResults(response.data);
    } catch (error) {
      console.error('Vision API Error:', error);
      // Fallback to mock analysis if API fails
      return this.fallbackAnalysis(imageUri);
    }
  }

  static fallbackAnalysis(imageUri) {
    // Mock analysis for testing when API isn't configured
    const mockIngredients = [
      'tomato', 'onion', 'garlic', 'olive oil', 'basil', 'mozzarella',
      'chicken breast', 'bell pepper', 'rice', 'soy sauce', 'carrot',
      'potato', 'broccoli', 'spinach', 'mushroom', 'lemon', 'parsley'
    ];
    
    // Randomly select 3-6 ingredients to simulate detection
    const numIngredients = Math.floor(Math.random() * 4) + 3;
    const selectedIngredients = [];
    
    for (let i = 0; i < numIngredients; i++) {
      const randomIndex = Math.floor(Math.random() * mockIngredients.length);
      const ingredient = mockIngredients[randomIndex];
      if (!selectedIngredients.find(ing => ing.name === ingredient)) {
        selectedIngredients.push({
          name: ingredient,
          confidence: 0.7 + (Math.random() * 0.3), // 70-100% confidence
          type: 'food_item'
        });
      }
    }

    return {
      ingredients: selectedIngredients,
      confidence: 0.8,
      totalDetected: selectedIngredients.length,
      isFallback: true
    };
  }

  static async imageToBase64(uri) {
    try {
      // For React Native, we need to handle the image differently
      // This is a simplified approach - in production you'd want to handle file reading properly
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error('Failed to process image');
    }
  }

  static processVisionResults(data) {
    if (!data.responses || data.responses.length === 0) {
      return { ingredients: [], confidence: 0 };
    }

    const response = data.responses[0];
    const ingredients = [];
    let totalConfidence = 0;
    let labelCount = 0;

    // Process label annotations (food items)
    if (response.labelAnnotations) {
      response.labelAnnotations.forEach(label => {
        if (this.isFoodRelated(label.description)) {
          ingredients.push({
            name: label.description,
            confidence: label.score,
            type: 'food_item'
          });
          totalConfidence += label.score;
          labelCount++;
        }
      });
    }

    // Process object localization (more precise food detection)
    if (response.localizedObjectAnnotations) {
      response.localizedObjectAnnotations.forEach(obj => {
        if (this.isFoodRelated(obj.name)) {
          ingredients.push({
            name: obj.name,
            confidence: obj.score,
            type: 'localized_object'
          });
          totalConfidence += obj.score;
          labelCount++;
        }
      });
    }

    // Process text (for packaged food labels)
    if (response.textAnnotations && response.textAnnotations.length > 1) {
      const textContent = response.textAnnotations[0].description.toLowerCase();
      const foodKeywords = this.extractFoodKeywords(textContent);
      
      foodKeywords.forEach(keyword => {
        ingredients.push({
          name: keyword,
          confidence: 0.8, // High confidence for text-based detection
          type: 'text_label'
        });
        totalConfidence += 0.8;
        labelCount++;
      });
    }

    const averageConfidence = labelCount > 0 ? totalConfidence / labelCount : 0;

    return {
      ingredients: ingredients.sort((a, b) => b.confidence - a.confidence),
      confidence: averageConfidence,
      totalDetected: labelCount
    };
  }

  static isFoodRelated(label) {
    const foodKeywords = [
      'food', 'fruit', 'vegetable', 'meat', 'fish', 'poultry', 'dairy', 'grain',
      'bread', 'rice', 'pasta', 'soup', 'salad', 'dessert', 'beverage',
      'apple', 'banana', 'tomato', 'carrot', 'chicken', 'beef', 'salmon',
      'milk', 'cheese', 'yogurt', 'egg', 'onion', 'garlic', 'herb', 'spice'
    ];

    return foodKeywords.some(keyword => 
      label.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  static extractFoodKeywords(text) {
    const foodKeywords = [
      'organic', 'natural', 'fresh', 'ripe', 'raw', 'cooked', 'grilled',
      'baked', 'fried', 'steamed', 'roasted', 'seasoned', 'spiced'
    ];

    return foodKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
  }
}
