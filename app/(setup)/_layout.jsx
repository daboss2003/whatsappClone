import React, { useRef } from 'react'
import { Stack } from 'expo-router'
import Colours,{ FontSize, brandColors }  from '../../constants/Colors';
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
        <Menu ref={menuRef} onSelect={()=> menuRef.current.close()}>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={24} color={brandColors[theme]} />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={{backgroundColor: theme === 'light' ? '#fff' : '#555', borderRadius: 10, shadowOffset: 10, shadowColor: Colours[theme].background}}>
            <MenuOption children={<ExternalLink href={'https://www.whatsapp.com'} style={{fontSize: FontSize.heading, color: brandColors[theme], fontWeight: 'bold', padding: 10}}>Help</ExternalLink>} />
          </MenuOptions>
        </Menu>
      ),
      headerStyle: {
        backgroundColor: Colours[theme].background
      },
      headerShadowVisible: false,
      headerTitleAlign: 'center',
      headerTitleStyle: { color: theme === 'light' ? brandColors.green.light : brandColors[theme], fontFamily: 'HelveticaBold' },
      headerBackVisible: false
    }}>
      <Stack.Screen name='index' options={{ title: 'Profile info' }} />
    </Stack>
  )
}



