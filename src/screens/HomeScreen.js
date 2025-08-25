import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { VisionService } from '../services/visionApi';

export default function HomeScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Request camera permissions
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle camera permission
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600 mb-4">No access to camera</Text>
        <TouchableOpacity
          className="bg-primary-500 px-6 py-3 rounded-lg"
          onPress={() => setHasPermission(null)}
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          type: 'camera',
          analyzed: false,
          ingredients: []
        };
        setImages(prev => [...prev, newImage]);
        // Automatically analyze the new image
        setTimeout(() => analyzeImage(newImage.id), 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Pick from gallery
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          uri: asset.uri,
          type: 'gallery',
          analyzed: false,
          ingredients: []
        }));
        setImages(prev => [...prev, ...newImages]);
        
        // Automatically analyze all new images
        setTimeout(() => {
          newImages.forEach(image => analyzeImage(image.id));
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  // Analyze image with Google Vision API
  const analyzeImage = async (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setIsAnalyzing(true);
    try {
      const analysis = await VisionService.analyzeImage(image.uri);
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, analyzed: true, ingredients: analysis.ingredients }
          : img
      ));

      // Only show alert for the first few images to avoid spam
      const analyzedCount = images.filter(img => img.analyzed).length;
      if (analyzedCount <= 3) {
        Alert.alert(
          'Analysis Complete', 
          `Detected ${analysis.ingredients.length} ingredients with ${Math.round(analysis.confidence * 100)}% confidence!`
        );
      }
    } catch (error) {
      console.error('Analysis failed for image:', imageId, error);
      // Mark as analyzed with empty ingredients so user can still continue
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, analyzed: true, ingredients: [], analysisFailed: true }
          : img
      ));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Remove image
  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Continue to review
  const continueToReview = () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please add at least one image before continuing.');
      return;
    }
    
    // Filter out images that failed analysis completely
    const validImages = images.filter(img => img.analyzed);
    
    if (validImages.length === 0) {
      Alert.alert('Analysis in Progress', 'Please wait for image analysis to complete before continuing.');
      return;
    }
    
    navigation.navigate('ImageReview', { images: validImages });
  };

  // Check if any images are still being analyzed
  const hasUnanalyzedImages = images.some(img => !img.analyzed);
  const hasAnalyzedImages = images.some(img => img.analyzed);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="items-center py-8">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="camera" size={40} color="#22c55e" />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">SnapChef</Text>
          <Text className="text-gray-600 text-center mb-2">
            Take photos of your ingredients and get AI-powered recipe recommendations!
          </Text>
          {(!process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY || 
            process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY === 'your_google_cloud_vision_api_key_here') && (
            <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2">
              <Text className="text-yellow-800 text-sm text-center">
                🔧 Demo Mode: Using mock data. Set up Google Cloud Vision API for real AI analysis.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="space-y-4 mb-8">
          <TouchableOpacity
            className="bg-primary-500 py-4 px-6 rounded-xl flex-row items-center justify-center space-x-3"
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text className="text-white text-lg font-semibold">Snap Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border-2 border-primary-500 py-4 px-6 rounded-xl flex-row items-center justify-center space-x-3"
            onPress={pickFromGallery}
          >
            <Ionicons name="images" size={24} color="#22c55e" />
            <Text className="text-primary-500 text-lg font-semibold">Pick from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {images.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Selected Images ({images.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
              {images.map((image) => (
                <View key={image.id} className="relative">
                  <Image
                    source={{ uri: image.uri }}
                    className="w-20 h-20 rounded-lg"
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removeImage(image.id)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                  
                  {/* Analysis Status Indicator */}
                  <View className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full items-center justify-center">
                    {!image.analyzed ? (
                      <View className="bg-blue-500 w-6 h-6 rounded-full items-center justify-center">
                        <ActivityIndicator size={12} color="white" />
                      </View>
                    ) : image.analysisFailed ? (
                      <View className="bg-red-500 w-6 h-6 rounded-full items-center justify-center">
                        <Ionicons name="warning" size={12} color="white" />
                      </View>
                    ) : (
                      <View className="bg-green-500 w-6 h-6 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </View>
                  
                  {/* Ingredient Count */}
                  {image.analyzed && !image.analysisFailed && (
                    <View className="absolute -bottom-8 left-0 right-0">
                      <Text className="text-xs text-gray-600 text-center">
                        {image.ingredients?.length || 0} ingredients
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            
            {/* Analysis Summary */}
            {hasAnalyzedImages && (
              <View className="mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
                <Text className="text-green-800 text-sm text-center">
                  ✓ {images.filter(img => img.analyzed && !img.analysisFailed).length} images analyzed successfully
                  {images.filter(img => img.analysisFailed).length > 0 && 
                    ` • ${images.filter(img => img.analysisFailed).length} failed (will use fallback recipes)`
                  }
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Continue Button */}
        {images.length > 0 && (
          <View className="space-y-3 mb-8">
            {/* Analysis Status */}
            {hasUnanalyzedImages && (
              <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <View className="flex-row items-center space-x-3">
                  <ActivityIndicator size={20} color="#3b82f6" />
                  <Text className="text-blue-800 font-medium">
                    Analyzing {images.filter(img => !img.analyzed).length} images...
                  </Text>
                </View>
                <Text className="text-blue-600 text-sm mt-2">
                  This may take a few seconds. You can continue once analysis is complete.
                </Text>
              </View>
            )}

            {/* Continue Button */}
            <TouchableOpacity
              className={`py-4 px-6 rounded-xl flex-row items-center justify-center space-x-3 ${
                hasAnalyzedImages ? 'bg-accent-500' : 'bg-gray-400'
              }`}
              onPress={continueToReview}
              disabled={!hasAnalyzedImages}
            >
              <Ionicons 
                name="arrow-forward" 
                size={24} 
                color={hasAnalyzedImages ? "white" : "#9ca3af"} 
              />
              <Text className={`text-lg font-semibold ${
                hasAnalyzedImages ? 'text-white' : 'text-gray-500'
              }`}>
                {hasAnalyzedImages 
                  ? `Continue to Review (${images.filter(img => img.analyzed).length} analyzed)`
                  : 'Waiting for Analysis...'
                }
              </Text>
            </TouchableOpacity>

            {/* Quick Analysis Button for Manual Control */}
            {hasUnanalyzedImages && (
              <TouchableOpacity
                className="bg-primary-500 py-3 px-6 rounded-xl flex-row items-center justify-center space-x-3"
                onPress={() => {
                  const unanalyzedImages = images.filter(img => !img.analyzed);
                  unanalyzedImages.forEach(img => analyzeImage(img.id));
                }}
                disabled={isAnalyzing}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text className="text-white font-medium">
                  {isAnalyzing ? 'Analyzing...' : 'Re-analyze Images'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



