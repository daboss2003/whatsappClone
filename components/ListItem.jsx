import { Text } from './Themed'
import React from 'react'
import { Alert, TouchableHighlight, View, useColorScheme } from 'react-native'
import Colors, { FontSize, brandColors } from '../constants/Colors'

export default function ListItem({ item }) {
  const theme = useColorScheme() ?? 'light'
  function alert() {
    Alert.alert('Coming soon', `${item.header} is not available in WhatsApp for now`)
  }
  return (
    <TouchableHighlight onPress={alert} underlayColor={brandColors.underlay[theme]}>
        <View style={{
            padding: 10,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
            backgroundColor: Colors[theme].background
        }}>
            {item.icon(Colors[theme].regularText)}
            <View style={{ flexBasis: '85%', alignItems: 'flex-start' }}>
                <Text style={{fontSize: FontSize.heading}}>{item.header}</Text>
                <Text style={{fontSize: FontSize.regular}} type={'regular'} numberOfLines={1}>{ item.text}</Text> 
            </View>
        </View>
    </TouchableHighlight>
  )
}