import { View } from 'react-native'
import React from 'react'
import {Image} from 'expo-image'
import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { blurhash } from '../constants/StaticData';


export default function contactImageScreen() {
    const {image, name} = useLocalSearchParams()
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',backgroundColor:'#000' }}>
          <StatusBar backgroundColor='#000' style='light' />
          <Stack.Screen options={{
            title: name,
            gestureEnabled: true,
            gestureDirection: 'vertical',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor:'#000'
           },
         }} />
         <Image
          style={{width: '100%', height: '50%'}}
          source={image.replace('images/', 'images%2F')}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        /> 
    </View>
  )
}