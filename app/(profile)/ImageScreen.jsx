import { View } from 'react-native'
import React, { useEffect } from 'react'
import {Image} from 'expo-image'
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { blurhash } from '../../constants/StaticData';
import * as NavigationBar from 'expo-navigation-bar';


export default function ImageScreen() {
  const { image } = useLocalSearchParams()

  useEffect(() =>{
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',backgroundColor:'#000' }}>
      <StatusBar backgroundColor='#000' style='light' />
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