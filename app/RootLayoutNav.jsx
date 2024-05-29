import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import {useAuth} from '../hooks/useAuth'

import { ActivityIndicator, useColorScheme } from 'react-native';
import { Text, View } from '../components/Themed';


export default function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser, isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
    <View style={{justifyContent: 'center'}}>
      <ActivityIndicator size={60} style={{marginBottom: 20}} />
      <Text style={{fontSize: 18, textAlign: 'center'}}>Loading...</Text>
    </View>
    )
  }
  if (currentUser === null || !isLoggedIn) {
      return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
  );
    }
    
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
