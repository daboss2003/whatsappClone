import { View, Text, TouchableOpacity, Dimensions, Alert, useColorScheme, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {blurhash} from  '../constants/StaticData'
import Colors, { FontSize, brandColors } from '../constants/Colors';
import { formatDate } from '../constants/formatDate';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleStartCall } from '../constants/placeCalls';
import { useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { MessageInput, RenderEmoji, SendDocument } from '../app/chat';
import { newChat } from '../constants/newChat';
import { Message } from '../constants/messageSchema';
import uuidv4 from 'react-native-uuid'
import { downLoadFile } from '../constants/getURI';


const {width, height} = Dimensions.get('window')

export default function StatusScreen({ data }) {
  const swiperRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const theme = useColorScheme() ?? 'light'
  const { connected, currentUser } = useAuth()
  const [showEmoji, setShowEmoji] = useState(false)
  const [showSendDocument, setShowSendDocument] = useState(false)
  const [textMessage, setTextMessage] = useState('')
  const [currentChat, setCurrentChat] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [reply, setReply] = useState(false)


  useEffect(() => {
    if(currentChat !== null) return
    newChat(currentUser.uid, data.uid, connected).then(data => setCurrentChat(data)).catch(err => Alert.alert('Error', err.message));
  }, [currentChat])


  useEffect(() => {
    Keyboard.addListener('keyboardDidHide', () => setReply(false));
    return () => {
      Keyboard.removeAllListeners('keyboardDidHide')
    }
  },[])
  

  useEffect(() => {
    let payload;
    if (data.status[currentIndex].type === 'text') {
      payload = data.status[currentIndex].statusText.text
    }
    if (data.status[currentIndex].type === 'image') {
      payload = { url: data.status[currentIndex].statusImage.url, text: data.status[currentIndex].statusImage.text }
    }
    if (data.status[currentIndex].type === 'video') {
      payload = { url: data.status[currentIndex].statusVideo.url, text: data.status[currentIndex].statusVideo.text }
    }
    const newMessage = new Message(data.uid, data.status[currentIndex].type, payload, uuidv4.v4(), null);
    setReplyMessage(newMessage)
  }, [currentIndex]);

  return (
      <View style={{flex: 1, height: reply ? (70 / 100) * height : height}}>
      <SwiperFlatList
      autoplay
      onChangeIndex={({index}) => setCurrentIndex(index)}
      autoplayDelay={30}
      showPagination
      data={data.status}
      nestedScrollEnabled
      renderItem={({ item }) => <EachStatus item={item} />}
      paginationStyle={{width, position: 'absolute', flexDirection :'row', top: 30, left: 0, zIndex: 55}}
      paginationStyleItem={{flex: 1, borderRadius: 5, height: 2, backgroundColor: Colors[theme].regularText }}
      paginationStyleItemActive={{backgroundColor: '#fff'}}
      ref={swiperRef}
      />
      <Header image={data.imageUrl} name={data.knownName ?? data.username} userID={data.uid} time={data.status[currentIndex].timestamp} />

      <View style={{position: 'absolute', bottom: 0, width, padding: 10}}>
        {reply ? <MessageInput
          showEmoji={showEmoji}
          setShowEmoji={setShowEmoji}
          textMessage={textMessage}
          showSendDocument={showSendDocument}
          setTextMessage={setTextMessage}
          setShowSendDocument={setShowSendDocument}
          currentUser={currentUser}
          connected={connected}
          sender={data}
          currentChat={currentChat}
          placeholder={'Reply'}
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          setReply={setReply}
        />
          :
          <TouchableOpacity style={{padding: 10, backgroundColor: brandColors.primary.dark, width: '100%', borderRadius: 15}} onPress={() => setReply(true)}>
            <Text style={{fontSize: FontSize.regular, color: '#fff'}}>Reply</Text>
          </TouchableOpacity>
        }
      </View>
        
      {showSendDocument && <SendDocument id={currentChat.id} setShowSendDocument={setShowSendDocument} sender={data} />}
        <RenderEmoji setShowEmoji={setShowEmoji} showEmoji={showEmoji} setTextMessage={setTextMessage} />
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
      <View style={{ position: 'absolute', bottom: 20, width, padding: 20, paddingBottom: 50, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems :'center'  }}>
        <Text style={{color: '#fff', fontSize: FontSize.heading}}>{ text }</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

function Header({ image, name, userID, time }) {
  const router = useRouter()
  const theme = useColorScheme() ?? 'light'
  const menuRef = useRef(null)
  const {currentUser, connected} = useAuth()



  async function voiceCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(false, currentUser.uid, userID, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    async function videoCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(true, currentUser.uid, userID, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
  }
  
  function openProfile() {
        router.navigate({pathname: '/userProfile', params:{userID}})
  }
  
  async function openMessage() {
    try {
      const chat = await newChat(currentUser.uid, userID, connected);
      const jsonValue = JSON.stringify(chat);
      await AsyncStorage.setItem('currentMessage', jsonValue);
      router.push('/chat')
    } catch (err) {
      console.log(err)
      Alert.alert('Error', err.message)
    }
  }


  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, position: 'absolute', top: 40, width, backgroundColor: 'rgba(0,0,0, 0.1)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AntDesign name="arrowleft" size={24} color="#fff" onPress={router.back} />
        <TouchableOpacity onPress={() => router.navigate({pathname: '/usersProfile', params:{userID}})}>
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
      <Menu onSelect={() => menuRef.current.close()} ref={menuRef}>
            <MenuTrigger>
                <Entypo name="dots-three-vertical" size={22} color={'#fff'} />
            </MenuTrigger>
           <MenuOptions optionsContainerStyle={{ backgroundColor: theme === 'light' ? '#fff' : brandColors.primary[theme], borderRadius: 10, shadowOffset: 10, shadowColor: Colors[theme].background, marginTop: 40, gap: 15, padding: 15 }}>
              <MenuOption onSelect={openMessage}>
                  <Text style={{ fontSize: FontSize.heading, color: Colors[theme].text }}>Message</Text>
              </MenuOption>
              <MenuOption onSelect={voiceCall}>
                  <Text style={{ fontSize: FontSize.heading, color: Colors[theme].text }}>Voice call</Text>
              </MenuOption>
              <MenuOption onSelect={videoCall}>
                  <Text style={{ fontSize: FontSize.heading, color: Colors[theme].text }}>Video call</Text>
              </MenuOption>
              <MenuOption onSelect={openProfile}>
                <Text style={{ fontSize: FontSize.heading, color: Colors[theme].text }}>View contact</Text>
              </MenuOption>
            </MenuOptions>
        </Menu>  
    </View>
  )
}