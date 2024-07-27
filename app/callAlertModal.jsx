import { View, Text } from '../components/Themed'
import React, { useEffect, useState } from 'react'
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {findUsers} from '../constants/findUsers'
import { TouchableHighlight, useColorScheme, Vibration, View as DefaultView, Dimensions, Text as DefaultText } from 'react-native';
import { Audio } from 'expo-av';
import Colors, { FontSize, brandColors } from '../constants/Colors';
import {blurhash} from '../constants/StaticData'
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';


const {width} = Dimensions.get('window')

export default function callAlertModal() {
    const { channelName, isVideoCall: callType, callerId, recieverId, callID } = useLocalSearchParams()
    const [userData, setUserData] = useState(null)
    const theme = useColorScheme() ?? 'light'
    const router = useRouter()
  const [sound, setSound] = useState(null);
  const isVideoCall = callType === 'true'
  
  


    useEffect(() => {
        findUsers(callerId).then(data => setUserData(data)).catch(err => console.log(err));
    }, []);
  
  const startVibration = () => {
    Vibration.vibrate([0, 3000, 3000], true);
  };

   const stopVibration = () => {
    Vibration.cancel();
  };

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/ring.mp3'),
      { shouldPlay: true, isLooping: true }
    );
    setSound(sound);
  };
  
  const playRingtone = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  const stopRingtone = async () => {
    if (sound) {
      await sound.stopAsync();
    }
  };

  useEffect(() => {
    loadSound()
    startVibration()
    playRingtone()

    return () => {
      stopRingtone()
      if (sound) {
        sound.unloadAsync();
      }
      
      stopVibration()
    }
  }, []);

  async function acceptCall() {
    await stopRingtone()
      if (sound) {
        await sound.unloadAsync();
      }
      
      stopVibration()
    router.navigate({pathname: 'callScreen', params:{channelName, isVideoCall, callerId, recieverId, callID }})
  }

  async function declineCall() {
     await stopRingtone()
      if (sound) {
        await sound.unloadAsync();
      }
      
      stopVibration()
    await firestore().collection('calls').doc(recieverId).delete()
    router.back()
  }



    if (userData === null) {
        return <View />
    }
  return (
    <SafeAreaView style={{flex: 1, paddingVertical: 30,  alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <DefaultView style={{width, padding: 15, gap: 20, backgroundColor: Colors[theme].background, paddingVertical: 30 }}>
        <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          
          <DefaultView>
            <Text style={{fontSize: FontSize.heading}}>{userData.knownName ?? userData.username}</Text>
            <Text style={{fontSize: FontSize.regular}} type={'regular'}>Incoming {isVideoCall ? 'video' : 'voice'} call</Text>
          </DefaultView>
            <Image
              style={{width: 50, height: 50, borderRadius: 25}}
              source={userData.imageUrl}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
              </DefaultView>
              <DefaultView style={{flexDirection: 'row', gap: 20, alignItems: 'center', justifyContent: 'flex-start'}}>
                <TouchableHighlight onPress={declineCall} underlayColor={brandColors.underlay[theme]}>
                  <DefaultText style={{color: theme === 'light' ? 'red' : brandColors.homeGreen[theme], fontSize: FontSize.heading}}>DECLINE</DefaultText>
                </TouchableHighlight>
                <TouchableHighlight onPress={acceptCall} underlayColor={brandColors.underlay[theme]}>
                  <DefaultText style={{color:  brandColors.homeGreen.dark, fontSize: FontSize.heading}}>ANSWER</DefaultText>
                </TouchableHighlight>
              </DefaultView>
        </DefaultView>
    </SafeAreaView>
  )
}
