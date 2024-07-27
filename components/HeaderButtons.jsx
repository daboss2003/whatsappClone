import { View, TouchableHighlight, StyleSheet, useColorScheme } from 'react-native'
import React, { useRef } from 'react'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { Entypo } from '@expo/vector-icons';
import { Link, usePathname, useRouter } from 'expo-router';
import { Text } from '../components/Themed';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Colors,{ brandColors } from '../constants/Colors';

export default function HeaderButtons({setSearch}) {
    const path = usePathname()
  const theme = useColorScheme() ?? 'light'
  const router = useRouter()
  const menuRef = useRef(null)
  return (
    <View style={styles.container}>
        <StatusBar backgroundColor={brandColors.primary[theme]} style='light' /> 
        <TouchableHighlight>
            <Feather name="camera" size={23} color="#fff" onPress={() => router.navigate('/cameraView')} />
        </TouchableHighlight>
          {path !== '/tools' && 
            <TouchableHighlight>
                <MaterialIcons name="search" size={25} color="#fff" onPress={() => setSearch(true)} />
            </TouchableHighlight>
        }
        <Menu onSelect={() => menuRef.current.close()} ref={menuRef}>
            <MenuTrigger>
                <Entypo name="dots-three-vertical" size={22} color={'#fff'} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{backgroundColor: theme === 'light' ? '#fff' : brandColors.primary[theme], borderRadius: 10, shadowOffset: 10, shadowColor:  Colors[theme].background, marginTop: 40}}>
                  <MenuOption style={{ fontSize: 20, color: Colors[theme].text, fontFamily: 'HelveticaBold', padding: 10 }} children={
                      <Link href={'/settings'}>
                        <Text>Settings</Text>
                      </Link>
                  }>
                </MenuOption>
            </MenuOptions>
        </Menu>    
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 18,
      alignItems: 'center',
      justifyContent: 'center',
    }
})