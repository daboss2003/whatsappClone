import { StatusBar } from 'expo-status-bar'
import { Text } from '../components/Themed'
import React, { useState , useEffect} from 'react'
import Colors, { brandColors, FontSize } from '../constants/Colors'
import { Alert, Dimensions, SafeAreaView, Switch, TouchableHighlight, useColorScheme, View, Text as DefaultText, ActivityIndicator } from 'react-native'
import Animated, {useAnimatedStyle, interpolate, Extrapolation, useSharedValue, useAnimatedScrollHandler, interpolateColor} from 'react-native-reanimated'
import { AntDesign, Entypo, Feather, Fontisto, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { openContact } from './contacts'
import { findUsers } from '../constants/findUsers'
import { formatDate } from '../constants/formatDate'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { newChat } from '../constants/newChat'
import { useAuth } from '../hooks/useAuth'
import IconList from '../components/IconList'
import { handleStartCall } from '../constants/placeCalls'
import { placeHolder } from '../constants/StaticData'
import {downLoadFile} from '../constants/getURI'



const {width} = Dimensions.get('window')

export default function usersProfile() {
    const scrollY = useSharedValue(0);
    const theme = useColorScheme() ?? 'light'
    const { userID } = useLocalSearchParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const scrollHandler = useAnimatedScrollHandler( {
        onScroll: (e) => {
            scrollY.value = e.contentOffset.y;
        }
    })
    const router = useRouter()
    const {currentUser, connected} = useAuth()

    useEffect(() => {
     if(user !== null) return
        async function getUser() {
            try {
                const user = await findUsers(userID)
                setUser(user)
            } catch (err) {
                console.log(err)
            }
           
        }
         getUser()
        
    }, [user]);
    

    async function openMessage() {
        setLoading(true)
    try {
      const chat = await newChat(currentUser.uid, user.uid, connected);
      const jsonValue = JSON.stringify(chat);
        await AsyncStorage.setItem('currentMessage', jsonValue);
        setLoading(false)
      router.push('/chat')
    } catch (err) {
      setLoading(false)
      console.log(err)
      Alert.alert('Error', err.message)
    }
    }
    
    async function voiceCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(false, currentUser.uid, user.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    async function videoCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(true, currentUser.uid, user.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    if (!user || loading) {
        return <ActivityIndicator size={60} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} />
    }

    
  return (
    <View style={{backgroundColor: Colors[theme].background}}>
          <StatusBar style='light' backgroundColor={brandColors.primary[theme]} />
          <CustomHeader scrollY={scrollY} userOBJ={user} />
          <Animated.ScrollView  onScroll={scrollHandler} scrollEventThrottle={16}>
            <View style={{ backgroundColor: Colors[theme].background, padding: 15, gap: 4, marginBottom: 6, justifyContent: 'center', alignItems: 'center', marginTop: 210, elevation: 6 }}>
                <Text style={{ fontSize: 20, textAlign: 'center' }}>{user.knownName ?? user.username}</Text>
                <Text style={{ fontSize: FontSize.heading, textAlign: 'center' }} type={'regular'}>{user.phoneNo}</Text> 
                  <Text style={{ fontSize: FontSize.regular, textAlign: 'center', marginBottom: 10 }} type={'regular'}>Last seen today at {formatDate(new Date().toISOString())}</Text>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableHighlight underlayColor={brandColors.underlay[theme]} style={{flex: 1, borderWidth: 0.2, borderRadius: 5, borderColor: Colors[theme].regularText, elevation: 2}} onPress={openMessage}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 2, padding: 6 }}>
                            <MaterialCommunityIcons name="android-messages" size={24} color={brandColors.homeGreen[theme]}  />
                           <Text style={{ fontSize: FontSize.heading, textAlign: 'center' }}>Message</Text> 
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor={brandColors.underlay[theme]} style={{flex: 1, borderWidth: 0.2, borderRadius: 5, borderColor: Colors[theme].regularText, elevation: 2}} onPress={voiceCall}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 2, padding: 6 }}>
                            <MaterialIcons name="phone" size={24} color={brandColors.homeGreen[theme]} />
                           <Text style={{ fontSize: FontSize.heading, textAlign: 'center' }}>Audio</Text> 
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor={brandColors.underlay[theme]} style={{flex: 1, borderWidth: 0.2, borderRadius: 5,  borderColor: Colors[theme].regularText, elevation: 2}} onPress={videoCall}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 2, padding: 6 }}>
                           <Feather name="video" size={24} color={brandColors.homeGreen[theme]} />
                           <Text style={{ fontSize: FontSize.heading, textAlign: 'center' }}>Video</Text> 
                        </View>
                    </TouchableHighlight>
                  </View>  
              </View>
              <View style={{ backgroundColor: Colors[theme].background, padding: 20, marginBottom: 6, elevation: 6  }}>
                <Text style={{ fontSize: FontSize.heading }} >{user.about ?? 'Hey there am using whatsApp!'}</Text>
              </View>
              <View style={{ backgroundColor: Colors[theme].background, padding: 20, marginBottom: 6,  elevation: 6  }}>
                <Text style={{ fontSize: FontSize.heading }} >Media, Links, and docs</Text>
              </View>
              <View style={{ backgroundColor: Colors[theme].background,  marginBottom: 6,  elevation: 6  }}>
                  <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null}>
                      <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center',padding: 20, }}>
                        <Ionicons name="notifications-outline" size={24} color={Colors[theme].regularText} />
                        <Text style={{ fontSize: FontSize.heading }} >Notifications</Text>
                      </View>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null}>
                      <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center', padding: 20, }}>
                        <Entypo name="image" size={24} color={Colors[theme].regularText} />
                        <Text style={{ fontSize: FontSize.heading }} >Media visibility</Text>
                      </View>
                  </TouchableHighlight>
              </View>
              <View style={{ backgroundColor: Colors[theme].background, marginBottom: 6,  elevation: 6  }}>
                  <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null}>
                      <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center', padding: 20, }}>
                        <Fontisto name="locked" size={24} color={Colors[theme].regularText} />
                        <View style={{gap: 1, flex: 1}}>
                            <Text style={{ fontSize: FontSize.heading }} >Encryption</Text>
                            <Text style={{ fontSize: FontSize.regular }} type={'regular'} >Message and calls are end-to-end encrypted. Tap to verify.</Text>
                        </View>
                      </View>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null}>
                      <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center',padding: 20, }}>
                        <Ionicons name="speedometer-outline" size={24} color={Colors[theme].regularText} />
                        <View style={{gap: 1, flex: 1}}>
                            <Text style={{ fontSize: FontSize.heading }} >Disappearing messages</Text>
                            <Text style={{ fontSize: FontSize.regular }} type={'regular'} >Off</Text>
                        </View>
                      </View>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null}>
                      <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center', padding: 20, }}>
                        <MaterialIcons name="mail-lock" size={24} color={Colors[theme].regularText} />
                          <View style={{gap: 1, flex: 1}}>
                            <Text style={{ fontSize: FontSize.heading }} >Chat lock</Text>
                            <Text style={{ fontSize: FontSize.regular }} type={'regular'} >Lock and hide this chat on this device.</Text>
                          </View>
                          <Switch thumbColor={Colors[theme].regularText } trackColor={{ false: Colors[theme].background, true: brandColors.homeGreen[theme]  }} />
                      </View>
                  </TouchableHighlight>
                 </View>
                  <View style={{ backgroundColor: Colors[theme].background, padding: 5, marginBottom: 6,  elevation: 6  }}>
                      <Text type={'regular'} style={{ fontSize: FontSize.regular }}>No groups in common</Text>
                      <IconList title={'Create group with ' + user.knownName ?? user.username} iconName={'group-add'} Icon={MaterialIcons} onPress={() => null} />
                  </View>
                  <View style={{ backgroundColor: Colors[theme].background, padding: 10, marginBottom: 6, gap: 10,  elevation: 6  }}>
                    <Text type={'regular'} style={{ fontSize: FontSize.regular }}>Other phones</Text>
                    <View style={{gap: 10, flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableHighlight style={{flexBasis: '50%'}} onPress={openMessage} underlayColor={brandColors.underlay[theme]}>
                            <View style={{padding: 10}}>
                                <Text style={{ fontSize: FontSize.heading }}>{user.phoneNo}</Text>
                                <Text type={'regular'} style={{ fontSize: FontSize.regular }}>Mobile</Text>  
                            </View> 
                        </TouchableHighlight>
                        <TouchableHighlight style={{flex: 1}} onPress={openMessage} underlayColor={brandColors.underlay[theme]}>
                            <MaterialCommunityIcons name="android-messages" size={24} color={brandColors.homeGreen[theme]} style={{padding: 10}}  />
                        </TouchableHighlight>
                      <TouchableHighlight style={{ flex: 1 }} onPress={voiceCall} underlayColor={brandColors.underlay[theme]}>
                            <MaterialIcons name="phone" size={24} color={brandColors.homeGreen[theme]} style={{padding: 10}} />
                        </TouchableHighlight>
                      <TouchableHighlight style={{ flex: 1 }} onPress={videoCall} underlayColor={brandColors.underlay[theme]}>
                            <Feather name="video" size={24} color={brandColors.homeGreen[theme]} style={{padding: 10}} />
                        </TouchableHighlight>
                    </View>
                  </View>
              <View style={{ backgroundColor: Colors[theme].background, marginBottom: 16,   elevation: 6  }}>
                <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null}>
                    <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center',padding: 20 }}>
                       <Entypo name="block" size={24} color="red" />
                        <DefaultText style={{ fontSize: FontSize.heading, color: 'red' }} >Block { user.knownName ?? user.username}</DefaultText>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null}>
                    <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center', padding: 20 }}>
                        <Feather name="thumbs-down" size={24} color="red" />
                        <DefaultText style={{ fontSize: FontSize.heading, color: 'red' }} >Report { user.knownName ?? user.username}</DefaultText>
                    </View>
                </TouchableHighlight>
              </View>
          </Animated.ScrollView>
    </View>
  )
}


function CustomHeader({ userOBJ, scrollY }) {
    const theme = useColorScheme() ?? 'light'
    const router = useRouter()
    const [uri, setUri] = useState(userOBJ.imageUrl)
    const {connected} = useAuth()

    const headerHeight = useAnimatedStyle(() => {
        return {
            height: interpolate(scrollY.value, [0, 250], [200, 64], Extrapolation.CLAMP),
            backgroundColor: interpolateColor(scrollY.value, [0, 250], [Colors[theme].background, brandColors.primary[theme]]),
            alignItems: scrollY.value < 250 ? 'flex-start' : 'center'
        }
    })

    const headerImageSize = useAnimatedStyle(() => {
        return {
            width: interpolate(scrollY.value, [0, 250], [width / 2, 40], Extrapolation.CLAMP),
            height: interpolate(scrollY.value, [0, 250], [width / 2, 40], Extrapolation.CLAMP),
            borderRadius: interpolate(scrollY.value, [0, 250], [width / 4, 20], Extrapolation.CLAMP),
           
        }
    })

    const headerTitle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: interpolate(scrollY.value, [0, 250], [-width, 0], Extrapolation.CLAMP) }],
            flex: interpolate(scrollY.value, [0, 250], [0, 2], Extrapolation.CLAMP),
            opacity: interpolate(scrollY.value, [0, 250], [0, 1], Extrapolation.CLAMP),
            width: interpolate(scrollY.value, [0, 250], [0, 100], Extrapolation.CLAMP),
        }
    })
    const containerStyle = useAnimatedStyle(() => {
        return {
            flex: interpolate(scrollY.value, [0, 250], [4, 0], Extrapolation.CLAMP),
        }
    });

    useEffect(() => {
        downLoadFile(connected, userOBJ.imageUrl).then(data => data !== null && setUri(data)).catch(err => console.log(err)); 
    }, []);


    return (
        <SafeAreaView style={{ backgroundColor: Colors[theme].background, position: 'absolute', top: 0, left:0, zIndex: 1000, width, marginTop: 30 }}>
            <Animated.View style={[{ flexDirection: 'row', padding: 10, flex: 1, gap: 10 }, headerHeight]}>
                <AntDesign name="arrowleft" size={24} color="#fff" onPress={router.back} />
                <Animated.View style={[containerStyle, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}]}>
                    <Animated.Image style={[headerImageSize]} source={{ uri: uri || placeHolder }} />
                </Animated.View>
                <Animated.Text style={[{ color: '#fff', fontSize: FontSize.heading, justifyContent :'center' }, headerTitle]}>{ userOBJ.knownName ?? userOBJ.username}</Animated.Text>
                <AntDesign name="contacts" size={24} color="#fff" onPress={openContact}  />
            </Animated.View>
        </SafeAreaView>
    )
} 




                        
                        