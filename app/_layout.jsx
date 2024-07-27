import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AuthProvider from '../context/AuthContext'
import RootLayoutNav from './RootLayoutNav';
import { MenuProvider } from 'react-native-popup-menu';
import 'expo-dev-client'
import { addEventListener } from "@react-native-community/netinfo";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NotificationPopup from 'react-native-push-notification-popup';
import { useRef } from 'react';
import { Dimensions, Keyboard, LayoutAnimation, Platform, UIManager, View } from 'react-native';



const { height } = Dimensions.get('window')

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function RootLayout() {

  const [connected, setConnected] = useState(false)
  const popupRef = useRef(null)
  const [keyboardVisible, setKeyboardVisisble] = useState(false)
  
  useEffect(() => {
    const useConnection = addEventListener(state => {
      setConnected(state.isConnected)
    });
    return () => {
      useConnection()
    }
  }, []);

  useEffect(() => {
    const keyboardShowEvent = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisisble(true)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear)
    });

    const keyboardDidHideEvent = Keyboard.addListener('keyboardDidHide', () => {
       setKeyboardVisisble(false)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    });


    return () => {
      keyboardDidHideEvent.remove()
      keyboardShowEvent.remove()
    }
  }, []);


  return (
    <View style={{height: keyboardVisible ? (70 / 100) * height : height, flex: 1}}>
      <AuthProvider connected={connected}>
      <MenuProvider>
        <GestureHandlerRootView>
          <RootLayoutNav popup={popupRef} />
        </GestureHandlerRootView>
      </MenuProvider>
       <NotificationPopup ref={popupRef} />
      </AuthProvider>
     </View>
  );
}




