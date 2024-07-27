import { View, Text, TouchableHighlight, useColorScheme, TouchableWithoutFeedback, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import {findUsers} from '../constants/findUsers'
import Colors, { FontSize, brandColors } from '../constants/Colors'
import {formatDate} from '../constants/formatDate'
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons'
import { Text as StyledText } from './Themed'
import { handleStartCall } from '../constants/placeCalls'
import { Image } from 'expo-image'
import { blurhash, placeHolder } from '../constants/StaticData'
import { useRouter } from 'expo-router'

export default function CallList({ call, multiple, setMultiple, selected, setSelected }) {
    const { currentUser, connected } = useAuth()
    const callerId = call.calls.find(item => item !== currentUser.uid)
    const [caller, setCaller] = useState(null)
    const theme = useColorScheme() ?? 'light'
    const imageRef = useRef(null)
    const router = useRouter()


    useEffect(() => {
        if (caller !== null) return
        findUsers(callerId).then(data => setCaller(data)).catch(err => console.log(err))
    }, [caller]);

    if (caller === null) {
        return <ActivityIndicator />
    }

    async function voiceCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(false, currentUser.uid, caller.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    async function videoCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(true, currentUser.uid, caller.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    function getImageSize() {
    imageRef.current.measure((fx, fy, width, height, px, py) => {
      router.navigate({ pathname: '/infoPreview', params: { name: caller.knownName ?? caller.username, image: caller.imageUrl ?? placeHolder, uid: caller.uid, x: px, y: py, width, height } })
    });
  }


  const userIsCaller = call.caller === currentUser.uid
  
  function decide() {
    if (multiple) {
      const alreadyExist = selected.some(item => item.id === call.id)
      if (alreadyExist) {
        setSelected(selected.filter(item => item.id !== call.id));
      }
      else {
        setSelected(prev => [...prev, call])
      }
    
     }
    else {
      call.isVideoCall ? videoCall() : voiceCall()
    }
  }

  function check() {
    if (multiple) {
      return
    }
    else {
      setSelected(prev => [...prev, call])
      setMultiple(true)
    }
  }

  return (
    <TouchableHighlight onPress={decide} style={{width: '100%', marginBottom: 5, padding: 10, }} underlayColor={brandColors.underlay[theme]} onLongPress={check}>
        <View style={{flexDirection: 'row', gap: 15, alignItems: "center"}}>
            <TouchableWithoutFeedback onPress={getImageSize} >
          <View style={{position: 'relative'}} ref={imageRef}>
            <Image
              style={{width: 50, height: 50, borderRadius: 25}}
              source={caller.imageUrl ?? placeHolder}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
              
            />
            {selected.some(item => item.id === call.id) && <AntDesign name="checkcircle" size={20} color={brandColors.homeGreen[theme]} style={{position: 'absolute', top: 30, left: 35 }}  />}
          </View>
        </TouchableWithoutFeedback>
            <View style={{flex: 1}}>
                <Text style={{ fontSize: FontSize.heading, color: call.missed ? 'red' : Colors[theme].regularText }}>{ caller.knownName ?? caller.username }</Text>
                  <View style={{ gap: 6, flexDirection: 'row' }}>
                      {
                        userIsCaller ?
                        <Feather name="arrow-up-right" size={20} color={brandColors.homeGreen[theme]} />  
                        :
                        <Feather name="arrow-down-left" size={20} color={call.missed ? 'red' : brandColors.homeGreen[theme]} />      
                    }
                    <StyledText style={{ fontSize: FontSize.regular }} type={'regular'}>{formatDate(call.timestamp) }</StyledText>
                </View>
              </View>
              {
                  call.isVideoCall ?
                      <Feather name="video" size={24} color={brandColors.homeGreen[theme]} onPress={videoCall} />
                      :
                      <MaterialIcons name="call" size={24} color={brandColors.homeGreen[theme]} onPress={voiceCall} />
              }
        </View>
    </TouchableHighlight>
  )
}