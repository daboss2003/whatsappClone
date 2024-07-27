import { StyleSheet, useColorScheme, TouchableOpacity, Text as DefaultText  } from 'react-native'
import React from 'react'
import Colors, { FontSize, brandColors } from '../constants/Colors'


export default function MyButton({full, onPress, children, transparent, text, tool}) {
    const theme = useColorScheme() ?? 'light';
  const length = full ? { width: '100%' } : { width: 'auto' }
  let backGround = transparent ? { backgroundColor: 'transparent', borderWidth: 0.4, borderColor: brandColors[theme] } : { backgroundColor: brandColors.green[theme] }
  let color = transparent ? { color: brandColors.green[theme] } : { color: theme === 'light' ? Colors.dark .text: Colors.light.text }
  
  if (text) {
    backGround = { backgroundColor: 'transparent' }
    color = {color: brandColors.homeGreen[theme]}
  }

  if (tool) {
    backGround = { backgroundColor: theme === 'light' ? brandColors.primary[theme] : brandColors.homeGreen[theme] }
  }
  return (
      <TouchableOpacity style={{ ...backGround, ...styles.button, ...length }} onPress={onPress}>
        <DefaultText style={{ ...color, ...styles.buttonText }}>
          {children}
        </DefaultText>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    button: {
    marginBottom: 15,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center'

  },
  buttonText: {
    textAlign: 'center',
    fontSize: FontSize.heading,
   
  }
})