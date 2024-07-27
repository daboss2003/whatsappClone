import {  View, Text } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image'
import { Stack, useLocalSearchParams } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { formatDate } from '../constants/formatDate';
import { blurhash } from '../constants/StaticData';
import { FontSize } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { downLoadFile } from '../constants/getURI';

export default function showMessageMedia() {
    const videoRef = useRef(null);
    const { type, url, name, timestamp } = useLocalSearchParams();
    const {connected} = useAuth()

    useEffect(() => {
        NavigationBar.setBackgroundColorAsync('#000');
    }, []);
  
  const part1 = url.split('messages')[0]
  const path = url.split('messages')[1]
  const part2 = path.split('?alt')[0]
  const part3 = path.split('?alt')[1]

  const [uri, setUri] = useState(`${part1}messages${encodeURIComponent(part2)}?alt${part3}`)
  

  useEffect(() => {
    if (type === 'video') {
      downLoadFile(connected, `${part1}messages${encodeURIComponent(part2)}?alt${part3}`).then(data => data !== null && setUri(data)).catch(err => console.log(err))
    }
  }, []);
  
  return (
    <View>
       <Stack.Screen options={{
            headerTitle: () => <Title time={timestamp} name={name} />,
            gestureEnabled: true,
            gestureDirection: 'vertical',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor:'#000'
           },
         }} />
          <StatusBar backgroundColor='#000' style='light' />
        {
            type === 'video' && 
            <>
            <Video
            ref={videoRef}
            style={{width: '100%', height: '100%'}}
            source={{
                uri: uri,
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            />
            </>
          }
          {
              type === 'image' && 
              <Image
                style={{width: '100%', height: '100%'}}
                source={`${part1}messages${encodeURIComponent(part2)}?alt${part3}`}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
            /> 
          }
    </View>
  )
}



function Title({time, name}) {
  
  return (
    <View style={{  gap: 2, justifyContent: 'center' }}>
      <Text style={{ fontSize: FontSize.heading, color: '#fff' }}>{name}</Text>
      <Text style={{ fontSize: FontSize.regular, color: '#fff' }}>{formatDate(time) }</Text>
    </View>
  )
}