import { View, Text } from '../components/Themed'
import { ActivityIndicator } from 'react-native'
import React from 'react'

export default function loader() {
  return (
    <View style={{justifyContent: 'center'}}>
      <ActivityIndicator size={60} style={{marginBottom: 20}} />
      <Text style={{fontSize: 18, textAlign: 'center'}}>Loading...</Text>
    </View>
  )
}