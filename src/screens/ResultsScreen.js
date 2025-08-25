import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ResultsScreen({ route, navigation }) {
  const { recipes, ingredients, images } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categorize recipes
  const categorizedRecipes = {
    all: recipes,
    quick: recipes.filter(r => r.readyInMinutes && r.readyInMinutes <= 30),
    healthy: recipes.filter(r => r.diet && ['vegetarian', 'vegan', 'gluten-free'].includes(r.diet)),
    popular: recipes.filter(r => r.confidence > 0.8)
  };

  const currentRecipes = categorizedRecipes[selectedCategory] || recipes;

  const openRecipeLink = (recipe) => {
    if (recipe.sourceUrl) {
      Linking.openURL(recipe.sourceUrl);
    } else {
      Alert.alert('Recipe Details', 'Full recipe details are available in the app.');
    }
  };

  const shareRecipe = (recipe) => {
    const shareText = `Check out this recipe: ${recipe.title}\n\nIngredients: ${recipe.usedIngredients?.map(i => i.name).join(', ')}\n\nTime: ${recipe.readyInMinutes || 'N/A'} minutes`;
    
    Alert.alert(
      'Share Recipe',
      shareText,
      [
        { text: 'Copy', onPress: () => Alert.alert('Copied!', 'Recipe details copied to clipboard.') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderRecipeCard = (recipe, index) => (
    <View key={recipe.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
      {/* Recipe Image */}
      {recipe.image && (
        <Image
          source={{ uri: recipe.image }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      
      {/* Recipe Content */}
      <View className="p-4">
        {/* Title and Confidence */}
        <View className="flex-row items-start justify-between mb-3">
          <Text className="text-xl font-bold text-gray-800 flex-1 mr-3">
            {recipe.title}
          </Text>
          {recipe.confidence && (
            <View className="bg-primary-100 px-2 py-1 rounded-full">
              <Text className="text-primary-700 text-xs font-medium">
                {Math.round(recipe.confidence * 100)}% match
              </Text>
            </View>
          )}
        </View>

        {/* Recipe Details */}
        <View className="flex-row items-center space-x-4 mb-3">
          {recipe.readyInMinutes && (
            <View className="flex-row items-center">
              <Ionicons name="time" size={16} color="#6b7280" />
              <Text className="text-gray-600 ml-1">{recipe.readyInMinutes} min</Text>
            </View>
          )}
          {recipe.servings && (
            <View className="flex-row items-center">
              <Ionicons name="people" size={16} color="#6b7280" />
              <Text className="text-gray-600 ml-1">{recipe.servings} servings</Text>
            </View>
          )}
          {recipe.cuisine && (
            <View className="bg-gray-100 px-2 py-1 rounded-full">
              <Text className="text-gray-700 text-xs">{recipe.cuisine}</Text>
            </View>
          )}
        </View>

        {/* Used Ingredients */}
        {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-2">Ingredients you have:</Text>
            <View className="flex-row flex-wrap">
              {recipe.usedIngredients.slice(0, 5).map((ingredient, idx) => (
                <View key={idx} className="bg-green-100 px-2 py-1 rounded-full mr-2 mb-1">
                  <Text className="text-green-700 text-xs">{ingredient.name}</Text>
                </View>
              ))}
              {recipe.usedIngredients.length > 5 && (
                <Text className="text-gray-500 text-xs">+{recipe.usedIngredients.length - 5} more</Text>
              )}
            </View>
          </View>
        )}

        {/* Missing Ingredients */}
        {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">You'll also need:</Text>
            <View className="flex-row flex-wrap">
              {recipe.missedIngredients.slice(0, 5).map((ingredient, idx) => (
                <View key={idx} className="bg-orange-100 px-2 py-1 rounded-full mr-2 mb-1">
                  <Text className="text-orange-700 text-xs">{ingredient.name}</Text>
                </View>
              ))}
              {recipe.missedIngredients.length > 5 && (
                <Text className="text-gray-500 text-xs">+{recipe.missedIngredients.length - 5} more</Text>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 bg-primary-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
            onPress={() => openRecipeLink(recipe)}
          >
            <Ionicons name="restaurant" size={16} color="white" />
            <Text className="text-white font-medium ml-2">View Recipe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-gray-200 p-3 rounded-lg"
            onPress={() => shareRecipe(recipe)}
          >
            <Ionicons name="share-outline" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Your Recipes</Text>
          <Text className="text-gray-600">
            Based on {ingredients.length} ingredients from {images.length} images
          </Text>
        </View>

        {/* Category Tabs */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            {Object.keys(categorizedRecipes).map(category => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category 
                    ? 'bg-primary-500' 
                    : 'bg-gray-200'
                }`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text className={`font-medium ${
                  selectedCategory === category 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({categorizedRecipes[category]?.length || 0})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recipes List */}
        <View className="px-6 py-4">
          {currentRecipes.length === 0 ? (
            <View className="bg-white p-8 rounded-xl items-center">
              <Ionicons name="restaurant-outline" size={64} color="#9ca3af" />
              <Text className="text-xl font-medium text-gray-600 mt-4 mb-2">No recipes found</Text>
              <Text className="text-gray-500 text-center">
                Try adding more ingredients or taking different photos
              </Text>
            </View>
          ) : (
            currentRecipes.map((recipe, index) => renderRecipeCard(recipe, index))
          )}
        </View>

        {/* Back Button */}
        <View className="px-6 py-6">
          <TouchableOpacity
            className="bg-gray-200 py-4 px-6 rounded-xl"
            onPress={() => navigation.navigate('Home')}
          >
            <Text className="text-gray-700 text-center font-medium text-lg">
              Start Over
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



