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







export default function RootLayout() {

  const [connected, setConnected] = useState(false)
  const popupRef = useRef(null)
  
  useEffect(() => {
    const useConnection = addEventListener(state => {
      setConnected(state.isConnected)
    });
    return useConnection
  }, []);

 


  return ( 
      <AuthProvider connected={connected}>
      <MenuProvider>
        <GestureHandlerRootView>
          <RootLayoutNav popup={popupRef} />
        </GestureHandlerRootView>
      </MenuProvider>
       <NotificationPopup ref={popupRef} />
      </AuthProvider>
  );
}




