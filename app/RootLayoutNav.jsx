import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import {useAuth} from '../hooks/useAuth'

import {  useColorScheme } from 'react-native';



export default function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
    <Stack>
      <Stack.Screen name='loader' options={{ headerShown: false}}/>
    </Stack>
    )
  }
  if (currentUser === null || !isLoggedIn) {
      return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false}} />
          </Stack>
        </ThemeProvider>
  );
    }
    
  if (!loading) {
    return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(setup)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
  }
}
