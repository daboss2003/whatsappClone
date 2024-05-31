import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AuthProvider from '../context/AuthContext'
import RootLayoutNav from './RootLayoutNav';
import { MenuProvider } from 'react-native-popup-menu';
import 'expo-dev-client'


export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();




export default function RootLayout() {
  const [loaded, error] = useFonts({
    Helvetica: require('../assets/fonts/Helvetica.ttf'),
    HelveticaBold: require('../assets/fonts/Helvetica-Bold.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);


  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <MenuProvider>
        <RootLayoutNav />
      </MenuProvider>
    </AuthProvider>
  );
}

