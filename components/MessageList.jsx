import { View, TouchableHighlight, useColorScheme, Text as DefaultText, TouchableWithoutFeedback, ActivityIndicator } from 'react-native'
import { Text } from './Themed'
import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {useLimitWords} from '../hooks/useLimitWords'
import Colors, { FontSize, brandColors } from '../constants/Colors'
import { Image } from 'expo-image'
import {placeHolder} from '../constants/StaticData'
import { useRouter } from 'expo-router'
import { blurhash } from '../constants/StaticData'
import { formatDate } from '../constants/formatDate'
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'
import { findUsers } from '../constants/findUsers'
import { updateSeen } from '../constants/messageSender'


export default function messageList({chat, onPress, onPressIn, selected, multiple, setMultiple}) {
  const theme = useColorScheme() ?? 'light'
  const { users, messages } = chat
  const { currentUser, connected } = useAuth()
  const [sender, setSender] = useState(null)
  let words = 'New Message';
  const lastMessage = messages[messages.length - 1]
  const userIsSender = lastMessage.senderId === currentUser.uid;
   const messageSeen = messages.filter(item => !item.seen);
  const lastMessageSenderIsUser = lastMessage.senderId === currentUser.uid;
  
  if (lastMessage.type === 'text') words = lastMessage.text;
  if (lastMessage.type === 'audio') words = 'Voice note';
  if (lastMessage.type === 'video') words = 'Video';
  if (lastMessage.type === 'image') words = 'Photo';
  const { limitText, setContainer } = useLimitWords(words)
   const { limitText: limitName, setContainer: limitNameContainer } = useLimitWords(sender !== null ? sender.knownName ?? sender.username : 'unknown') 
  const imageRef = useRef(null)
  const router = useRouter()


  useEffect(() => {
     if(sender !== null) return
     const senderID = users.find(item => item !== currentUser.uid);
    findUsers(senderID).then(data => setSender(data)).catch(err => console.log(err));
    },[sender]);

  function getImageSize() {
    imageRef.current.measure((fx, fy, width, height, px, py) => {
      router.navigate({ pathname: '/infoPreview', params: { name: sender.knownName ?? sender.username, image: sender.imageUrl ?? placeHolder, uid: sender.uid, x: px, y: py, width, height } })
    });
  }

  async function select() {
    if (multiple) {
      const alreadyExist = selected.some(item => item.id === chat.id)
      if (alreadyExist) {
        onPressIn(selected.filter(item => item.id !== chat.id));
      }
      else {
        onPressIn(prev => [...prev, chat]);
      }
      
    }
    else {
      if (!userIsSender && connected) {
      const updated = messages.map(item => {
        if (item.senderId !== currentUser.uid) {
          return { ...item, seen: true }
        }
        else {
          return item
        }
      });
      updateSeen(chat.id, updated).catch(err => console.log(err));
    }
    onPress(chat);
    }
  }

  function handleLongPress() {
    if (multiple) {
      return
    }
    else {
      setMultiple(true)
      onPressIn(prev => [...prev, chat]);
    }
  }

 

  if (sender === null) {
    return <View size={60} style={{justifyContent: 'center', alignItems: 'center', flex: 1}} />
  }

  return (
    <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={select} style={{marginBottom: 5, width: '100%', padding: 10}} onLongPress={handleLongPress}>
      <View style={{ flexDirection: 'row', gap: 15, flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
        <TouchableWithoutFeedback onPress={getImageSize} >
          <View style={{position: 'relative'}} ref={imageRef}>
            <Image
              style={{width: 50, height: 50, borderRadius: 25}}
              source={sender.imageUrl ?? placeHolder}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
              
            />
            {selected.some(item => item.id === chat.id) && <AntDesign name="checkcircle" size={18} color={brandColors.homeGreen[theme]} style={{position: 'absolute', top: 30, left: 35 }}  />}
          </View>
        </TouchableWithoutFeedback>
            <View style={{flex: 1}}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                <Text style={{ fontSize: FontSize.heading, flex: 1 }} onLayout={(event) => {
                const { width } = event.nativeEvent.layout
                limitNameContainer(width)
                  }}>{limitName }</Text>
                <DefaultText style={{fontSize: FontSize.regular, color: lastMessage.seen || userIsSender ? Colors[theme].regularText  : brandColors.homeGreen[theme]}}>{ formatDate(lastMessage.timestamp)}</DefaultText>  
              </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {lastMessageSenderIsUser ? lastMessage.seen ? <Ionicons name="checkmark-done-outline" size={18} color={brandColors.blueColor} /> : <Feather name="check" size={18} color={Colors[theme].regularText} /> : ''}
                <Text style={{ fontSize: FontSize.regular, flex: 1 }} onLayout={(event) => {
                const { width } = event.nativeEvent.layout
                setContainer(width)
                  }} type={'regular'}>{limitText }</Text>
               {messageSeen.length > 0 && !userIsSender && <DefaultText style={{ fontSize: FontSize.regular, color: theme === 'dark' ? '#000' : '#fff', width: 20, height: 20, borderRadius: 10, backgroundColor: brandColors.homeGreen[theme], justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>{messageSeen.length }</DefaultText>} 
              </View>
            </View> 
        </View>
    </TouchableHighlight>
  )
}