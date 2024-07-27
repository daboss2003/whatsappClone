import React, { useRef } from 'react'
import { Stack } from 'expo-router'
import Colours,{ brandColors }  from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import ExternalLink from '../../components/ExternalLink';



export default function _layout() {
  const theme = useColorScheme() ?? 'light';
  const menuRef = useRef(null)
  return (
    <Stack screenOptions={{
      headerRight: () => (
        <Menu onSelect={() => menuRef.current.close()} ref={menuRef}>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={22} color={brandColors[theme]} />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={{backgroundColor: theme === 'light' ? '#fff' : '#343F45', borderRadius: 10, shadowOffset: 10, shadowColor:  Colours[theme].background, marginTop: 20}}>
            <MenuOption children={<ExternalLink href={'https://www.whatsapp.com'} style={{fontSize: 20, color: brandColors[theme], fontFamily: 'HelveticaBold', padding: 10}}>Help</ExternalLink>} />
          </MenuOptions>
        </Menu>
      ),
      headerStyle: {
        backgroundColor: Colours[theme].background
      },
      headerShadowVisible: false,
      headerTitleAlign: 'center',
      headerTitleStyle: { color: theme === 'light' ? brandColors.green.light : brandColors[theme], fontFamily: 'HelveticaBold' },
      animationTypeForReplace: "push",
      customAnimationOnGesture: true,
      animation: "slide_from_right",
      fullScreenGestureEnabled: true,
      gestureEnabled: true,
    }}>
      <Stack.Screen name='index' options={{ title: '' }} />
      <Stack.Screen name='sendOTP' options={{ title: 'Enter your phone number' }} />
      <Stack.Screen name='modal' options={{ title: '', presentation: 'transparentModal', headerShown: false }} />
      <Stack.Screen name='[phoneNo]' options={{ title: `Verify your number`, headerBackVisible: false}}  />
    </Stack>
  )
}


