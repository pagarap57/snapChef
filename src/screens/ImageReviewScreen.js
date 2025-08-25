import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RecipeService } from '../services/recipeService';

export default function ImageReviewScreen({ route, navigation }) {
  const { images } = route.params;
  const [isGenerating, setIsGenerating] = useState(false);

  // Flatten all detected ingredients from all images
  const allIngredients = images.flatMap(img => img.ingredients || []);
  
  // Remove duplicates and sort by confidence
  const uniqueIngredients = allIngredients
    .filter((ingredient, index, self) => 
      index === self.findIndex(i => i.name.toLowerCase() === ingredient.name.toLowerCase())
    )
    .sort((a, b) => b.confidence - a.confidence);

  const generateRecipes = async () => {
    if (uniqueIngredients.length === 0) {
      Alert.alert('No Ingredients', 'No ingredients were detected in the images.');
      return;
    }

    setIsGenerating(true);
    try {
      const recipes = await RecipeService.generateRecipes(uniqueIngredients, 8);
      
      if (recipes.length === 0) {
        Alert.alert('No Recipes Found', 'No recipes were found for the detected ingredients.');
        return;
      }

      navigation.navigate('Results', { 
        recipes, 
        ingredients: uniqueIngredients,
        images 
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="items-center py-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Review Ingredients</Text>
          <Text className="text-gray-600 text-center">
            Review the ingredients detected by AI and generate recipes
          </Text>
        </View>

        {/* Images Summary */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Analyzed Images ({images.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            {images.map((image) => (
              <View key={image.id} className="items-center">
                <Image
                  source={{ uri: image.uri }}
                  className="w-16 h-16 rounded-lg"
                />
                <Text className="text-xs text-gray-600 mt-1 text-center">
                  {image.ingredients?.length || 0} ingredients
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Detected Ingredients */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Detected Ingredients ({uniqueIngredients.length})
          </Text>
          
          {uniqueIngredients.length === 0 ? (
            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-gray-600 text-center">
                No ingredients were detected. Try taking clearer photos or different angles.
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {uniqueIngredients.map((ingredient, index) => (
                <View key={index} className="bg-gray-50 p-4 rounded-lg flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-medium text-gray-800 capitalize">
                      {ingredient.name}
                    </Text>
                    <Text className="text-sm text-gray-600 capitalize">
                      {ingredient.type.replace('_', ' ')}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-primary-600">
                      {Math.round(ingredient.confidence * 100)}%
                    </Text>
                    <Text className="text-xs text-gray-500">confidence</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Generate Recipes Button */}
        {uniqueIngredients.length > 0 && (
          <TouchableOpacity
            className={`py-4 px-6 rounded-xl mb-8 flex-row items-center justify-center space-x-3 ${
              isGenerating ? 'bg-gray-400' : 'bg-accent-500'
            }`}
            onPress={generateRecipes}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size={24} color="white" />
            ) : (
              <Ionicons name="restaurant" size={24} color="white" />
            )}
            <Text className="text-white text-lg font-semibold">
              {isGenerating ? 'Generating Recipes...' : 'Generate Recipes'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View className="bg-blue-50 p-4 rounded-lg mb-8">
          <Text className="text-blue-800 font-medium mb-2">💡 Tips for Better Results:</Text>
          <Text className="text-blue-700 text-sm">
            • Take clear, well-lit photos of ingredients{'\n'}
            • Include multiple angles for complex items{'\n'}
            • Ensure ingredients are clearly visible{'\n'}
            • Avoid shadows and reflections
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
