import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import {  Platform, useColorScheme } from 'react-native';
import Colors, { brandColors } from '../constants/Colors';
import { useEffect, useMemo, useRef, useState } from 'react';
import {useAuth} from '../hooks/useAuth'
import { storeData } from '../constants/fetchContacts';
import * as NavigationBar from 'expo-navigation-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import firestore from '@react-native-firebase/firestore'
import { router } from 'expo-router';
import { findUsers } from '../constants/findUsers'
import {formatDate} from '../constants/formatDate'






export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleRegistrationError(errorMessage) {
  console.log(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}





export default function RootLayoutNav({popup}) {
  const theme = useColorScheme() ?? 'light';
  const { connected, isLoggedIn, loading, currentUser } = useAuth()
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();


  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => console.log(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) return
    if (!connected) return
    if (!expoPushToken || expoPushToken === '') return
    firestore().collection('Users').doc(currentUser.uid).update({pushToken: expoPushToken}).catch(err => console.log(err))
  }, [isLoggedIn, connected, loading, expoPushToken]);


  const [loaded, error] = useFonts({
    Helvetica: require('../assets/fonts/Helvetica.ttf'),
    HelveticaBold: require('../assets/fonts/Helvetica-Bold.ttf'),
    ...FontAwesome.font,
  });
  
  useEffect(() => {
    if (!isLoggedIn) return
    if (connected) {
      storeData().then(() => console.log('done')).catch((err) => console.log(err))
    }
  }, [connected, isLoggedIn]);

  useEffect(() =>{
    NavigationBar.setBackgroundColorAsync(Colors[theme].background);
    NavigationBar.setButtonStyleAsync(theme);
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

 
  useEffect(() => {
    if (loaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, loading]);
  
  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) return

    else {
      AsyncStorage.getItem('userInfo').then(data => {
        if (data === null) {
            router.replace('/(setup)')
        }
      }).catch(err => console.log(err))
    }
  }, [loading, isLoggedIn]);

  const memoizedNotification = useMemo(() => notification, [notification]);

  useEffect(() => {
    if (memoizedNotification) {
      if (popup.current) {
        ShowPopUp()
      }
    }
  }, [memoizedNotification]);

  async function ShowPopUp() {
    const { message, messageId } = memoizedNotification.request?.content?.data
    if (!messageId) {
      return
    }
    try {
      const currentMessage = await firestore().collection('chats').doc(messageId).get()
      if (currentMessage.exists) {
        const messages = {id: currentMessage.id, ...currentMessage.data()}
        const senderId = currentMessage.data().users.find(item => item !== currentUser.uid);
        const sender = await findUsers(senderId)
        const time = new Date().toISOString()
        popup.current.show({
          onPress: () =>  openChat(messages),
          appIconSource: {uri: sender.imageUrl},
          appTitle: 'New message',
          timeText: formatDate(time),
          title: sender.knownName ?? sender.username,
          body: message,
          slideOutTime: 10000
        });
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  async function openChat(messages) {
    try {
      const jsonValue = JSON.stringify(messages);
      await AsyncStorage.setItem('currentMessage', jsonValue);
      router.navigate('/chat')
    } catch (err) {
      console.log(err)
    }
  }



  if (!loaded || loading) {
    return null;
  }


  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName='(app)' screenOptions={{
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
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animationTypeForReplace: 'push',
          customAnimationOnGesture: true,
          animation: "slide_from_right",
          fullScreenGestureEnabled: true,
          
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false}} />
        <Stack.Screen name="(setup)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        <Stack.Screen name="infoPreview" options={{ presentation: 'transparentModal', gestureDirection: 'vertical', headerShown: false, animation: 'none' }} />
        <Stack.Screen name="cameraView" options={{ headerShown: false }} />
        <Stack.Screen name="previewCaptured" options={{ headerShown: false }} />
        <Stack.Screen name="usersProfile" options={{ headerShown: false }} />
        <Stack.Screen name="addStatus" options={{ headerShown: false }} />
        <Stack.Screen name="statusDisplay" options={{ headerShown: false }} />
        <Stack.Screen name="callAlertModal" options={{ presentation: 'transparentModal', gestureDirection: 'vertical', headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="userStatus" options={{ headerShown: false }} />
        <Stack.Screen name="callScreen" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
  );
}
  

