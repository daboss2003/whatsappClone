import { View, Text, TouchableOpacity, Dimensions, useColorScheme, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {blurhash} from  '../constants/StaticData'
import Colors, { FontSize } from '../constants/Colors';
import { formatDate } from '../constants/formatDate';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import {downLoadFile} from '../constants/getURI'

const {width} = Dimensions.get('window')

export default function userStatusScreen() {
    const swiperRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const theme = useColorScheme() ?? 'light'
    const { userInfo } = useAuth()
    const [userStatus, setUserStatus] = useState([]);

    useEffect(() => {
        AsyncStorage.getItem('userStatus').then(data => data != null ? setUserStatus(JSON.parse(data)) : setUserStatus([])).catch(err => console.log(err));
    }, []);
  
  if (userStatus.length <= 0) {
    return <ActivityIndicator size={60} style={{justifyContent: 'center', alignItems: 'center', flex: 1}} />
  }

  return (
    <View style={{flex: 1}}>
      <SwiperFlatList
      autoplay
      onChangeIndex={({index}) => setCurrentIndex(index)}
      autoplayDelay={30}
      showPagination
      data={userStatus}
      renderItem={({ item }) => <EachStatus item={item} />}
      paginationStyle={{width, position: 'absolute', flexDirection :'row', top: 30, left: 0, zIndex: 55}}
      paginationStyleItem={{flex: 1, borderRadius: 5, height: 2, backgroundColor: Colors[theme].regularText }}
      paginationStyleItemActive={{backgroundColor: '#fff'}}
      ref={swiperRef}
      />
      <Header image={userInfo.imageUrl} name={'You'} time={userStatus[currentIndex].timestamp} />
    </View>
  )
}


function EachStatus({ item }) {
  const videoRef = useRef(null);
  const {connected} = useAuth()
  const [uri, setUri] = useState('')

  let text;
  if (item.type === 'image') {
    text = item.statusImage.text
  }
  if (item.type === 'video') {
    text = item.statusVideo.text
  }

  useEffect(() => {
    if (item.type === 'video') {
      setUri(item.statusVideo.url)
      downLoadFile(connected, item.statusVideo.url).then(data => data !== null && setUri(data)).catch(err => console.log(err))
    }
  }, []);


  return (
    <KeyboardAvoidingView style={{flex: 1, width}}>
      {
        item.type === 'text' &&
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: item.statusText.color, padding: 20}}>
          <Text style={{color: '#fff', fontSize: 28, textAlign: 'center', lineHeight: 35}}>{ item.statusText.text}</Text>
        </View>
      }
      {
        item.type === 'image' && 
        <Image
              style={{width: '100%', height: '100%'}}
              source={item.statusImage.url}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
      }
      {
        item.type === 'video' &&
        <>
          <Video
            ref={videoRef}
            style={{width: '100%', height: '100%'}}
            source={{
                uri: uri
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            />
        </>
      }
      {
        item.type !== 'text' &&
        <View style={{ position: 'absolute', bottom: 20, width, padding: 20, paddingBottom: 50, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems :'center' }}>
        <Text style={{color: '#fff', fontSize: FontSize.heading}}>{ text }</Text>
        </View>
      }
    </KeyboardAvoidingView>
  )
}

function Header({ image, name, time }) {
  const router = useRouter()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, position: 'absolute', top: 40, width, backgroundColor: 'rgba(0,0,0, 0.1)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AntDesign name="arrowleft" size={24} color="#fff" onPress={router.back} />
        <TouchableOpacity onPress={() => router.navigate('/(profile)')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image
              style={{width: 40, height: 40, borderRadius: 20}}
              source={image}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            <View>
              <Text style={{ fontSize: FontSize.heading, color: '#fff' }}>{name}</Text>
              <Text style={{ fontSize: FontSize.regular, color: '#fff' }}>{ formatDate(time)}</Text>
            </View>
        </View>
      </TouchableOpacity>
      </View>  
    </View>
  )
}