import { TouchableOpacity, useColorScheme, StyleSheet } from 'react-native'
import React from 'react'
import Colors, { brandColors } from '../constants/Colors'

export default function FAB({ onPress, Icon, name, decrease }) {
    const theme = useColorScheme() ?? 'light'
  return (
      <TouchableOpacity onPress={onPress} style={{ ...styles.Fab, backgroundColor: theme === 'light' ? brandColors.primary[theme] : brandColors.homeGreen[theme]  }}>
        <Icon size={decrease ? 22 : 25} color={ Colors[theme].background} name={name} /> 
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    Fab: {
        padding: 15,
        borderRadius: 15,
        position: 'absolute',
        right: 20,
        bottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6
    }
})