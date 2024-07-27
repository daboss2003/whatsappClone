import React from 'react'
import { Stack } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons';
import { uploadImage } from '../../constants/uploadImage';
import {useAuth} from '../../hooks/useAuth'
import { brandColors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function _layout() {
  const { userInfo, currentUser } = useAuth();
  const { imageUrl } = userInfo;
  const { uid } = currentUser;
  const theme = useColorScheme() ?? 'light'
  return (
    <Stack screenOptions={{
          headerTitleStyle: {
              fontFamily: 'HelveticaBold',
              color: '#fff',
              letterSpacing: 1.5,
              fontFamily: 'HelveticaBold',
              fontSize: 23
            },
            headerStyle: {
              backgroundColor: brandColors.primary[theme],
            },
          headerTintColor: '#fff',
          animationTypeForReplace: "push",
          customAnimationOnGesture: true,
          animation: "slide_from_right",
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
            
        }}>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="ImageScreen" options={({ route }) => ({
            title: route.params.headerTitle,
            headerShadowVisible: false,
            headerStyle: {
               backgroundColor:'#000'
            },
            headerTintColor: '#fff',
            headerRight: () => <MaterialIcons name="edit" size={24} color="#fff" onPress={() => uploadImage(imageUrl, uid)} />,
          })} />
    </Stack>
  )
}