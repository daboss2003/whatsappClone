import { StyleSheet, useColorScheme, TouchableOpacity, Text as DefaultText  } from 'react-native'
import React from 'react'
import { brandColors } from '../constants/Colors'


export default function MyButton({full, onPress, children, transparent}) {
    const theme = useColorScheme() ?? 'light';
  const length = full ? { width: '100%' } : { width: 'auto' }
  const backGround = transparent ? { backgroundColor: 'transparent', borderWidth: 0.4, borderColor: brandColors[theme] } : { backgroundColor: brandColors.green[theme] }
  const color = transparent ? {color: brandColors.green[theme]} : {color: theme === 'light' ? brandColors.dark : brandColors.light}
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
    paddingVertical: 12,
    paddingHorizontal: 20

  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
   
  }
})