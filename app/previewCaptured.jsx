import { View, Text, TextInput, useColorScheme, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { AntDesign, Ionicons, Entypo, Foundation } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { blurhash } from '../constants/StaticData'
import { Video, ResizeMode } from 'expo-av';
import { sendImageMessage } from '../constants/messageSender'
import { useAuth } from '../hooks/useAuth'
import { addImageOrVideoStatus } from '../constants/addStatus'
import { StatusBar } from 'expo-status-bar'
import * as NavigationBar from 'expo-navigation-bar';
import { brandColors } from '../constants/Colors'


export default function previewCaptured() {
    const router = useRouter()
    const { message, uri, type, status: check, sender } = useLocalSearchParams()
    const videoRef = useRef(null);
    const [caption, setCaption] = useState('');
    const { connected, currentUser, userInfo } = useAuth()
  const isStatus = check === 'true'
  const [loading, setLoading] = useState(false)
  const theme = useColorScheme() ?? 'light'
  

  useEffect(() =>{
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  async function tryToSend() {
      setLoading(true)
       await sendImageMessage(uri, message, connected, currentUser.uid, type, caption, sender,  userInfo.username);
       setLoading(false)
        router.navigate('/chat')
    }

    function selectUsers() {
        router.navigate({ pathname: '/selectMultiple', params: { type, uri, text: caption } });
  }
  
  async function addStatus() {
    setLoading(true)
    await addImageOrVideoStatus(currentUser.uid, type === 'picture' ? 'image' : 'video', { url: uri, text: caption }, connected);
    setLoading(false)
    router.navigate('/(app)/updates');
  }

if (loading) {
    return <ActivityIndicator size={60} style={{justifyContent: 'center', alignItems: 'center', flex: 1}} />
  }

  return (
      <KeyboardAvoidingView style={{flex:  1}}>
      <AntDesign name="close" size={24} color="#fff" onPress={router.back} style={{position: 'absolute',top: 30, zIndex: 50,padding: 10,}} />
      <StatusBar style='light' backgroundColor='#000' />
        <View style={{flex: 5}}>
          {
            type === 'picture' &&
            <Image
            style={{width: '100%', height: '100%'}}
            source={uri}
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
            /> 
          }
          {
              type === 'video' &&
              <>
                <Video
                ref={videoRef}
                style={{width: '100%', height: '100%'}}
                source={{ uri }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              shouldPlay
                />
                </>
           } 
          </View>
          <View style={{gap: 10, padding: 10, flexDirection:'row', justifyContent: 'flex-end', alignItems: 'center', flex: 1, backgroundColor: '#000', maxHeight: 80}}>
              <TextInput
              placeholder='Add a caption...'
              value={caption}
              keyboardAppearance={theme}
              keyboardType='default'
              cursorColor={brandColors.homeGreen[theme]}
              multiline
              placeholderTextColor='#fff'
              onChangeText={value => setCaption(value)}
              style={{ backgroundColor: brandColors.primary.dark, flex :1, padding: 8, borderRadius: 20, color: '#fff' }}
              /> 
        {
          message && message.length ?
            <Ionicons name="send" size={24} color="#fff" onPress={tryToSend} style={{ padding: 12, borderRadius: 24, backgroundColor: brandColors.homeGreen[theme] }} />
            :
            isStatus ?
              <Ionicons name="send" size={24} color="#fff" onPress={addStatus} style={{ padding: 12, borderRadius: 24, backgroundColor: brandColors.homeGreen[theme] }} />
              :
              <AntDesign name="check" size={22} color="#fff" onPress={selectUsers} style={{ padding: 12, borderRadius: 24, backgroundColor: brandColors.homeGreen[theme] }} />
        }
          </View>
    </KeyboardAvoidingView>
  )
}