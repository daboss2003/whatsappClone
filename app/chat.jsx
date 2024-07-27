import { ActivityIndicator, Alert, KeyboardAvoidingView, useColorScheme, View as DefaultView, Text as DefaultText, StyleSheet, TextInput, SectionList, Keyboard, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore'
import { View , Text  } from '../components/Themed'
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors, { brandColors, FontSize, backgroungImages } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth'
import { Image, ImageBackground } from 'expo-image'
import { blurhash } from '../constants/StaticData';
import { AntDesign, Entypo, Feather, FontAwesome, FontAwesome6,  Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { structureDataForList } from '../constants/structureDataForList'
import SingleMessage from '../components/SingleMessage'
import {formatDate, formatDuration} from '../constants/formatDate'
import {  sendTextMessage, updateSeen, uploadAudio } from '../constants/messageSender';
import EmojiKeyboard from 'rn-emoji-keyboard';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker'
import { findUsers } from '../constants/findUsers';
import {handleStartCall} from '../constants/placeCalls'
import Animated ,{ runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import SearchBar from '../components/SearchBar';




const {height, width} = Dimensions.get('window')

export default function chat() {
    const [storedChat, setStoredChat] = useState(null);
    const [currentChat, setCurrentChat] = useState(null);
    const theme = useColorScheme() ?? 'light'
    const { connected, currentUser } = useAuth()
    const [sender, setSender] = useState(null)
    const [showEmoji, setShowEmoji] = useState(false)
    const [showSendDocument, setShowSendDocument] = useState(false)
    const [textMessage, setTextMessage] = useState('')
    const listRef = useRef(null)
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const [replyMessage, setReplyMessage] = useState(null)
    const audioInstances = useRef({});
    const [playingId, setPlayingId] = useState(null);
    const [pausedId, setPausedId] = useState(null);
    const [progress, setProgress] = useState({});
    const [duration, setDuration] = useState({});
    const [selected, setSelected] = useState([]);
    const [multiple, setMultiple] = useState(false)
    const [query, setQuery] = useState('')
    const [openSearch, setOpenSearch] = useState(false)

    



    useEffect(() => {
    return () => {
      for (const id in audioInstances.current) {
        audioInstances.current[id].unloadAsync();
      }
    };
  }, []);

    
    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('currentMessage');
            if (jsonValue != null) { 
                setStoredChat(JSON.parse(jsonValue));
                setCurrentChat(JSON.parse(jsonValue))
            }
        } catch (e) {
            console.log(e)
        }
    };

    useEffect(() => {
        getData()
    }, []);

    const memoizedStoreObj = useMemo(() => storedChat, [storedChat]);


    useEffect(() => {
        if (memoizedStoreObj === null) return
        if (!connected) return
        const subscriber = firestore()
        .collection('chats')
        .doc(storedChat.id)
        .onSnapshot(documentSnapshot => {
            if (documentSnapshot.exists) {
                setCurrentChat({ id: documentSnapshot.id, ...documentSnapshot.data() });
            }
        });
        return () => subscriber();
    }, [memoizedStoreObj, connected]);

    useEffect(() => {
        if (connected) return
        getData()
        
    }, [connected]);


    useEffect(() => {
        if (memoizedStoreObj !== null) {
            const senderID = memoizedStoreObj.users.find(item => item !== currentUser.uid);
            findUsers(senderID).then(data => setSender(data)).catch(err => console.log(err))
        }    
    }, [memoizedStoreObj]);
   
    async function scrollToEnd() {
        if (currentChat !== null) {
            if (listRef.current) {
            const structuredData = structureDataForList(currentChat.messages)
                if (structuredData.length > 0) {
                    listRef.current.scrollToLocation({itemIndex: structuredData[structuredData.length - 1].data.length - 1, sectionIndex: structuredData.length - 1})
                }
        }
            if (currentUser.uid !== currentChat.messages[currentChat.messages.length - 1].senderId) {
                const notSeen = currentChat.messages.filter(item => item.seen === false && item.senderId !== currentUser.uid)
                if (notSeen.length > 0) {
                    const newMessages = currentChat.messages.map(item => ({ ...item, seen: true }));
                    try {
                        await updateSeen(currentChat.id, newMessages)
                    }
                    catch (err) {
                        console.log(err)
                    }
                }
            }
        }
       
    }

    function handleScroll(event) {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const isAtEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20
        setShowScrollBtn(!isAtEnd)
    }

    const loadSound = async (id, uri) => {
        try { 
            if (!audioInstances.current[id]) {
            const sound = new Audio.Sound();
            await sound.loadAsync({ uri });
            const status = await sound.getStatusAsync();
            setDuration((prev) => ({ ...prev, [id]: status.durationMillis }));
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && (status.isPlaying || status.positionMillis > 0)) {
                setProgress((prev) => ({ ...prev, [id]: status.positionMillis }));
                }
                if (status.didJustFinish && !status.isLooping) {
                    setProgress((prev) => ({ ...prev, [id]: 0 }));
                    setPausedId(null)
                    setPlayingId(null)
                }
            });
            audioInstances.current[id] = sound;
            }
        }
        catch (err) {
            console.log(err)
        }
    };
    
     const playSound = async (id, uri) => {
         try {
            if (playingId !== null && playingId !== id) {
            await audioInstances.current[playingId].pauseAsync();
            }
            await loadSound(id, uri);
            if (pausedId === id) {
            await audioInstances.current[id].playAsync();
            setPausedId(null);
            } else {
            await audioInstances.current[id].replayAsync();
            }
            setPlayingId(id);
         }
         catch (err) {
            console.log(err)
         }
    };
    
    const pauseSound = async (id) => {
        try {
            if (playingId === id) {
            await audioInstances.current[id].pauseAsync();
            setPlayingId(null);
            setPausedId(id);
            }
        }
        catch (err) {
            console.log(err)
        }
    };
    
    const updateProgress = async (id, value) => {
        try {
            if (playingId === id) {
            await audioInstances.current[id].setPositionAsync(value);
            }
        }
        catch (err) {
            console.log(err)
        }
  };



     if (currentChat === null || sender === null) {
        return (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size={60} style={{marginBottom: 20}} />
                <Text style={{fontSize: FontSize.regular, textAlign: 'center'}} full={true}>plese wait we are getting your chats...</Text>
            </View>
        )
    }

   


return (
    <>
    <DefaultView style={{maxHeight: showEmoji ? '55%' : height + 50, flex: 2}}>
       <StatusBar style='light' backgroundColor={brandColors.primary[theme]} /> 
        <Stack.Screen options={{
              headerTintColor: '#fff',
              headerStyle: {
                  backgroundColor: brandColors.primary[theme],
                  
                },
                headerShown: selected.length > 0 || openSearch ? false : true,
              headerTitleAlign: 'left',
              headerTitle: () => <Title image={sender?.imageUrl} name={sender?.knownName ?? sender?.username} userID={sender?.uid} />,
              headerRight: () => <HeaderRightButtons currentUser={currentUser} user={sender} connected={connected} setOpenSearch={setOpenSearch} />
          }} />

            {
                showScrollBtn &&
                <FontAwesome6 name="angles-down" size={15} color={Colors[theme].regularText} onPress={scrollToEnd} style={{ position: 'absolute', top: '80%', right: 15, padding: 10, borderRadius: 25, zIndex: 55, backgroundColor: theme === 'light' ? Colors[theme].background : brandColors.primary[theme] }} />
            }

            {
               selected.length > 0 &&  <SelectionHeader selected={selected} setSelected={setSelected} chatID={currentChat.id} setMultiple={setMultiple} />
            }
            {
                openSearch && <SearchBar openSearch={openSearch} setOpenSearch={setOpenSearch} searchQuery={query} setSearchQuery={setQuery} />
            }
          <ImageBackground placeholderContentFit='cover' placeholder={blurhash} transition={1000} source={backgroungImages[theme]} style={{flex: 1, padding: 10, paddingBottom: 0, }}>
                <SectionList
                  sections={structureDataForList(currentChat.messages)}
                  keyExtractor={(item, index) => JSON.stringify(item) + index}
                  renderItem={({ item }) => (
                      <SingleMessage
                          message={item}
                          sender={sender}
                          setReplyMessage={setReplyMessage}
                          playSound={playSound}
                          pauseSound={pauseSound}
                          progress={progress}
                          playingId={playingId}
                          updateProgress={updateProgress}
                          duration={duration}
                          selected={selected}
                          setSelected={setSelected}
                          multiple={multiple}
                          setMultiple={setMultiple}
                          query={query}
                      />
                  )}
                  renderSectionHeader={({section: {date}}) => (
                      <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
                          <Text style={{fontSize: FontSize.regular, backgroundColor: theme === 'light' ? Colors[theme].background : brandColors.primary[theme], paddingHorizontal: 15, paddingVertical: 2, borderRadius: 5}} type={'regular'}>{formatDate(date)}</Text>
                    </DefaultView>
                  )}
                  stickySectionHeadersEnabled={true}
                  style={{}}
                  ref={listRef}
                  onContentSizeChange={scrollToEnd}
                  onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onScrollToIndexFailed={(err) => console.log(err)}
              />
                <MessageInput
                    setShowEmoji={setShowEmoji}
                    showEmoji={showEmoji}
                    textMessage={textMessage}
                    showSendDocument={showSendDocument}
                    setTextMessage={setTextMessage}
                    setShowSendDocument={setShowSendDocument}
                    currentChat={currentChat}
                    currentUser={currentUser}
                    connected={connected}
                    replyMessage={replyMessage}
                    setReplyMessage={setReplyMessage}
                    sender={sender}
                    placeholder={'Message'}
                />
            </ImageBackground>
        </DefaultView>
        {
            showSendDocument &&
            <SendDocument id={currentChat.id} setShowSendDocument={setShowSendDocument} sender={sender} />
        }
        <RenderEmoji setShowEmoji={setShowEmoji} showEmoji={showEmoji} setTextMessage={setTextMessage} />
      </>
  )
}



export function MessageInput({ showEmoji, setShowEmoji, textMessage, showSendDocument, setTextMessage, setShowSendDocument, currentChat, currentUser, connected, replyMessage, setReplyMessage, sender, placeholder, setReply = () => null }) {
    const theme = useColorScheme() ?? 'light'
    const inputRef = useRef(null)
    const router = useRouter()
    const { isRecording, stopRecording, startRecording, duration } = useAudioRecorder(connected, currentUser.uid);
    const scale = useSharedValue(1)
    const {userInfo} = useAuth()

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        }
    });

    useEffect(() => {
        if (showEmoji || showSendDocument) {
            Keyboard.dismiss()
        }
        else {
            inputRef.current?.focus()
        }
    }, [showEmoji, showSendDocument]);

    function handlePressIn() {
        scale.value = withSpring(2)
        startRecording()
    }
    function handlePressOut() {
        scale.value = withSpring(1)
        stopRecording(currentChat.id, sender.pushToken, userInfo.username)
    }


    
 
    return (
            <DefaultView style={{flexDirection: 'row', gap : 2, alignItems: 'flex-end', paddingVertical: 8, position: 'relative'}}>
                <DefaultView style={{padding: 8, backgroundColor: theme === 'light' ? Colors[theme].background : brandColors.primary[theme], gap: 10, borderRadius: 18, flex: 1, alignItems: 'center'}}>
                    {
                        replyMessage && replyMessage !== null &&
                        <DefaultView style={{borderRadius: 8, width: '100%', backgroundColor: replyMessage.senderId !== currentUser.uid ? brandColors.homeGreen[theme] : brandColors.blueColor}}>
                            <DefaultView style={{ marginLeft: 5, flexDirection: 'row', justifyContent: 'space-between',backgroundColor: theme === 'light' ? Colors[theme].background : brandColors.primary[theme], paddingHorizontal: 6}}>
                                 <FontAwesome name="times-circle" size={16} color="rgba(0,0,0,0.6)" style={{position: 'absolute', right: 4, top: 4, zIndex: 50}} onPress={()=> setReplyMessage(null)} />   
                                <DefaultView>
                                        <DefaultText style={{ fontSize: FontSize.heading, color: replyMessage.senderId !== currentUser.uid ? brandColors.homeGreen[theme] : brandColors.blueColor }}>
                                            {replyMessage.senderId === currentUser.uid ? 'You' : sender.knownName ?? sender.username}
                                        </DefaultText> 
                                        <Text type={'regular'} style={{ fontSize: FontSize.extreme }} full={true}> 
                                            {replyMessage.type === 'text' ? replyMessage.text.length > 100 ? replyMessage.text.slice(0, 97) + '...' : replyMessage.text : replyMessage[replyMessage.type].text ?? replyMessage.type}
                                        </Text>
                                </DefaultView>
                                    {
                                        replyMessage.type === 'image' || replyMessage.type === 'video' ?
                                        <Image placeholder={blurhash}  source={replyMessage.type === 'image' ? replyMessage.image.url : require('../assets/images/video.gif')} style={{width: 50, height: 50, borderTopRightRadius: 10, borderBottomRightRadius: 10}} /> : ''
                                    }
                            </DefaultView>
                        </DefaultView>
                    }
                       <DefaultView style={{flexDirection: 'row', gap: 15, alignItems: 'center', paddingHorizontal: 8 }}>
                        {
                            showEmoji ?
                                 <Entypo name="keyboard" size={20} color={Colors[theme].regularText} onPress={() => setShowEmoji(false)} />
                                : 
                               <Entypo name="emoji-happy" size={20} color={Colors[theme].regularText} onPress={() => setShowEmoji(true)} />
                        }
                            <TextInput
                                keyboardAppearance={theme}
                                keyboardType='default'
                                cursorColor={brandColors.homeGreen[theme]}
                                multiline
                                placeholder={placeholder}
                                placeholderTextColor={Colors[theme].regularText}
                                value={textMessage}
                                ref={inputRef}
                                onChangeText={(text) => setTextMessage(text)}
                                style={{ flex: 1, color: Colors[theme].text }}
                                editable={!showSendDocument}
                            />
                        {
                            showSendDocument
                                ?
                                <Entypo name="keyboard" size={20} color={Colors[theme].regularText} onPress={() => setShowSendDocument(false)} />
                                :
                                <FontAwesome name="paperclip" size={20} color={Colors[theme].regularText} onPress={() => setShowSendDocument(true)} />
                        }
                        {
                            textMessage
                                ?
                                ''
                                :
                                <Feather name="camera" size={20} color={Colors[theme].regularText} onPress={() => router.navigate({ pathname: '/cameraView', params: { message: currentChat.id, sender: sender.pushToken } })} />
                        }
                      </DefaultView>
                   </DefaultView> 
                {
                    textMessage
                    ?
                    <Ionicons name="send" size={20} color="#fff" onPress={() => {
                    sendTextMessage(textMessage, currentChat.id, currentUser.uid, connected, replyMessage, sender.pushToken, userInfo.username)
                    setTextMessage('')
                    Keyboard.dismiss()
                    setShowSendDocument(false) 
                    setShowEmoji(false)
                    setReplyMessage(null)
                    setReply(false)
                }} style={{ padding: 12, borderRadius: 24, backgroundColor: brandColors.homeGreen[theme] }} />
                    :
                <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
                    <Animated.View style={[animatedStyle, { width: 45, height: 45, borderRadius: 23, backgroundColor: brandColors.homeGreen[theme], justifyContent: 'center', alignItems: 'center', zIndex: 50 }]}>
                        <FontAwesome name="microphone" size={20} color="#fff" />
                    </Animated.View>
                    </TouchableWithoutFeedback>
                }
                {
                isRecording &&
                <DefaultView style={{flexDirection: 'row', width: '82%', position: 'absolute', top: 10, padding: 10, backgroundColor: theme === 'light' ? Colors[theme].background : brandColors.primary[theme], gap: 10, borderRadius: 25, flex: 1, alignItems: 'center', paddingHorizontal: 15}}>
                    <FontAwesome name="microphone" size={24} color="red" />
                    <Text type={'regular'}>{formatDuration(duration) }</Text>
                </DefaultView>
            }
                </DefaultView>

    )
}








function Title({image, name, userID}) {
  const router = useRouter()
  return (
    <TouchableOpacity onPress={() => router.navigate({pathname: '/usersProfile', params:{userID}})} style={{marginLeft: -20}}>
        <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
            style={{width: 35, height: 35, borderRadius: 18}}
            source={image}
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
          />
          <DefaultText style={{ fontSize: FontSize.heading, color: '#fff' }}>{ name }</DefaultText>
    </DefaultView>
    </TouchableOpacity>
  )
}










function HeaderRightButtons({currentUser, user, connected, setOpenSearch}) {
    const theme = useColorScheme() ?? 'light'
    const menuRef = useRef(null)
    const router = useRouter()

    async function voiceCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(false, currentUser.uid, user.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    async function videoCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(true, currentUser.uid, user.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    function openProfile() {
        router.navigate({pathname: '/usersProfile', params:{userID: user.uid}})
    }

  return (
    <DefaultView style={styles.container}>
          <MaterialCommunityIcons name="video-outline" size={24} color="#fff" onPress={videoCall} />
          <MaterialIcons name="call" size={22} color="#fff" onPress={voiceCall} />
        <Menu onSelect={() => menuRef.current.close()} ref={menuRef}>
            <MenuTrigger>
                <Entypo name="dots-three-vertical" size={18} color={'#fff'} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{backgroundColor: theme === 'light' ? '#fff' : brandColors.primary[theme], borderRadius: 10, shadowOffset: 10, shadowColor:  Colors[theme].background, marginTop: 40, gap: 15, padding: 15}}>
              <MenuOption onSelect={openProfile}>
                <Text style={{ fontSize: FontSize.heading }}>View contact</Text>
                </MenuOption>
                <MenuOption onSelect={() => setOpenSearch(true)}>
                  <Text style={{ fontSize: FontSize.heading }}>Search</Text>
              </MenuOption>
            </MenuOptions>
        </Menu>    
    </DefaultView>
  )
}





export function SendDocument({ id, setShowSendDocument, sender }) {
    const router = useRouter()
    const { connected, currentUser, userInfo } = useAuth()
    const theme = useColorScheme() ?? 'light'

    async function selecteFromGallery() {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        });
        setShowSendDocument(false)
        if (!result.canceled) {
        const uri = result.assets[0].uri;
        router.navigate({ pathname: '/previewCaptured', params: { message: id, uri, type: result.assets[0].type, sender: sender.pushToken } });
        }
    }

    async function pickAndUploadAudio() {
        try {
             setShowSendDocument(false)
            let result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', multiple: true });
            if (!result.canceled) {
                if(connected){
                    for (const audio of result.assets) {
                        await uploadAudio(audio.uri, id, connected, currentUser.uid, sender.pushToken, userInfo.username);
                    }
                }
                else {
                    Alert.alert('Offline', 'connect to the internet to send audio');
                }
            }
            else {
                Alert.alert('Error', 'unable to complete task try again')
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    return (
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 20}}>
        <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
            <SimpleLineIcons name="picture" size={20} color="#0f5397" onPress={selecteFromGallery} style={{padding: 20, borderRadius : 5, backgroundColor: theme === 'light'? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.5)', borderWidth: 0.3, borderColor: brandColors.underlay[theme]}} />
            <Text type={'regular'} style={{fontSize: FontSize.regular}}>Galery</Text>
        </DefaultView>
        <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
                <FontAwesome name="camera" size={20} color="#852c51" onPress={() => {
                    setShowSendDocument(false)
                    router.navigate({ pathname: '/cameraView', params: { message: id, sender: sender.pushToken } })
                }} style={{padding: 20, borderRadius : 5, backgroundColor: theme === 'light'? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)', borderWidth: 0.3, borderColor: brandColors.underlay[theme]}} />
            <Text type={'regular'} style={{fontSize: FontSize.regular}}>Camera</Text>
        </DefaultView>
        <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
            <Entypo name="location-pin" size={20} color="#165f54" style={{padding: 20, borderRadius : 5, backgroundColor: theme === 'light'? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)', borderWidth: 0.3, borderColor: brandColors.underlay[theme]}} />
            <Text type={'regular'} style={{fontSize: FontSize.regular}}>Location</Text>
        </DefaultView>
        <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
            <Ionicons name="person" size={20} color="#17485f" style={{padding: 20, borderRadius : 5, backgroundColor: theme === 'light'? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)', borderWidth: 0.3, borderColor: brandColors.underlay[theme]}} />
            <Text type={'regular'} style={{fontSize: FontSize.regular}}>Contact</Text>
        </DefaultView>
        <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
            <Ionicons name="document-text" size={20} color="#464387" style={{padding: 20, borderRadius : 5, backgroundColor: theme === 'light'? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)', borderWidth: 0.3, borderColor: brandColors.underlay[theme]}} />
            <Text type={'regular'} style={{fontSize: FontSize.regular}}>Document</Text>
        </DefaultView>
        <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
            <FontAwesome6 name="headphones" size={20} color="#553a33" onPress={ pickAndUploadAudio} style={{padding: 20, borderRadius : 5, backgroundColor: theme === 'light'? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)', borderWidth: 0.3, borderColor: brandColors.underlay[theme]}} />
            <Text type={'regular'} style={{fontSize: FontSize.regular}}>Audio</Text>
        </DefaultView>
        <DefaultView style={{justifyContent: 'center', alignItems: 'center'}}>
            <MaterialCommunityIcons name="poll" size={20} color="#585034" style={{padding: 20, borderRadius : 5, backgroundColor: theme === 'light'? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)', borderWidth: 0.3, borderColor: brandColors.underlay[theme]}} />
            <Text type={'regular'} style={{fontSize: FontSize.regular}}>Poll</Text>
        </DefaultView>
    </View>
    )
}






export function RenderEmoji({ showEmoji, setShowEmoji, setTextMessage }) {
    const theme = useColorScheme() ?? 'light'
    
    return (
        <EmojiKeyboard
        open={showEmoji}
        onClose={() => setShowEmoji(false)} 
        onEmojiSelected={(emoji) => setTextMessage(prev => `${prev}${emoji.emoji}`)}
        enableSearchBar
        allowMultipleSelections
        theme={{
        backdrop: 'tranparent',
        knob: brandColors.homeGreen[theme],
        container: theme === 'light' ? "#fff" : '#282829',
        header: brandColors[theme],
        skinkTonesContainer: theme === 'light' ? "#eee" : '#252427',
            category: {
            icon: brandColors.homeGreen[theme],
            iconActive: '#fff',
            container: theme === 'light' ? "#fff" : '#282829',
            containerActive: brandColors.homeGreen[theme],
        },
        search: {
            text: brandColors[theme],
            placeholder: Colors[theme].regularText,
            icon: brandColors[theme],
            background: theme === 'light' ? "#eee" : '#252427',
        }
            }}
        
        />
    )
}

function SelectionHeader({ selected, setSelected, setMultiple, chatID }) {
  const theme = useColorScheme() ?? 'light'
  const { connected } = useAuth()

  async function deleteChat() {
    if (!connected) {
      Alert.alert('Offline', 'connect to the internet to complete this action')
      return
      }
      const batch = firestore().collection('chats').doc(chatID)
    for (const data of selected) {
        await batch.update({ messages: firestore.FieldValue.arrayRemove(data) });
    }
    setSelected([])
    setMultiple(false)
  }

  useEffect(() => {
    return () => {
      setMultiple(false)
    }
  }, [])


  const headerWidth = useSharedValue(0)
  const opacity = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    width: headerWidth.value,
    opacity: opacity.value
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    headerWidth.value = withTiming(width, { duration: 500, easing: Easing.out(Easing.ease) })
  }, []);

  const handleClose = () => {
     opacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
     headerWidth.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
       runOnJS(setSelected)([])
       runOnJS(setMultiple)(false)
     });
   }
 
  if (!selected || selected.length <= 0) {
        return <View style={{width: 0, height: 0}} />
    }

  return (
    <Animated.View style={[{maxHeight: 64,  padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors[theme].background, zIndex: 1000, flex: 1, marginTop: 30}, animatedStyle]}>
      <StatusBar backgroundColor={Colors[theme].background} style={theme === 'light' ? 'dark' : 'light'} />
      <DefaultView style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <AntDesign name="arrowleft" size={24} color={Colors[theme].text} onPress={ handleClose} />
        <Text style={{ fontSize: FontSize.heading }}>{selected.length }</Text>
      </DefaultView>
      <AntDesign name="delete" size={24} color={Colors[theme].text} onPress={deleteChat} />
    </Animated.View>
  )
}







const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 18,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
  
})