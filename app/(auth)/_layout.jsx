import React from 'react'
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
  return (
    <Stack screenOptions={{
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={24} color={brandColors[theme]} />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={{backgroundColor: Colours[theme].background, borderRadius: 10}}>
            <MenuOption children={<ExternalLink href={'https://www.whatsapp.com'} style={{fontSize: 20, color: brandColors[theme], fontWeight: 'bold', padding: 10}}>Help</ExternalLink>} />
          </MenuOptions>
        </Menu>
      ),
      headerStyle: {
        backgroundColor: Colours[theme].background
      },
      headerShadowVisible: false,
      headerTitleAlign: 'center',
      headerTitleStyle: { color: theme === 'light' ? brandColors.green.light : brandColors[theme], fontFamily: 'HelveticaBold' },
    }}>
      <Stack.Screen name='index' options={{ title: '' }} />
      <Stack.Screen name='sendOTP' options={{ title: 'Enter your phone number' }} />
      <Stack.Screen name='modal' options={{ title: '', presentation: 'transparentModal', headerShown: false }} />
      <Stack.Screen name='[phoneNo]' options={{ title: `Verify your number`, headerBackVisible: false}}  />
    </Stack>
  )
}


