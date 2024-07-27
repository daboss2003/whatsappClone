import { StyleSheet, View, useColorScheme, TouchableWithoutFeedback, Text as DefaultText, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors, { FontSize, brandColors } from '../constants/Colors'
import { HighLightText, Text } from './Themed'
import { useAuth } from '../hooks/useAuth'
import { formatPlayingTime, formatTime } from '../constants/formatDate'
import { Image } from 'expo-image'
import { blurhash } from '../constants/StaticData'
import { AntDesign, Entypo, FontAwesome, Foundation, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Slider from '@react-native-community/slider';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { downLoadFile } from '../constants/getURI'


const SWIPE_THRESHOLD = 70;

const {width} = Dimensions.get('window')


export default function SingleMessage({ message, sender, setReplyMessage, playSound, pauseSound, progress, playingId, duration, updateProgress, selected, setSelected, multiple, setMultiple, query }) {
  const theme = useColorScheme() ?? 'light'
  const { currentUser, userInfo, connected } = useAuth()
  const { senderId, timestamp, type, text, image, video, audio, reply, seen, id } = message
  const userIsSender = senderId === currentUser.uid
  const router = useRouter();
  const translateX = useSharedValue(0);
  const [uri, setUri] = useState(audio);



  useEffect(() => {
    if (type === 'audio') {
      downLoadFile(connected, audio).then(data => data !== null && setUri(data)).catch(err => console.log(err))
    }
  }, []);


  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0) {
          translateX.value = event.translationX;
        }
    }).onEnd(() => {
      'worklet'
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(setReplyMessage)(message);
      }
      translateX.value = withSpring(0)
    });
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    }
  })



  function navigate() {
    if (type === 'image' || type === 'video') {
      router.navigate({ pathname: '/showMessageMedia', params: { url: type === 'image' ? image.url : video.url, timestamp, type, name: userIsSender ? 'You' : sender.knownName ?? sender.username } });
    }
    
  }

  function decide() {
    if (multiple) {
      const exist = selected.some(item => item.id === id)
      if (exist) {
        const newSelected = selected.filter(item => item.id !== id);
        setSelected(newSelected)
      }
      else {
        setSelected(prev => [...prev, message]);
      }
    }
    else {
      if (type === 'image' || type === 'video') {
        navigate()
      }
      else {
        return
      }
    }
  }

  function handleLongPress() {
    if (multiple) {
      return
    }
    else {
      setMultiple(true)
      setSelected(prev => [...prev, message]);
    }
  }

  
 
  return (
    <View style={{flexDirection: 'row', justifyContent: userIsSender ? 'flex-end' : 'flex-start', marginBottom: userIsSender ? 10 : 15, backgroundColor: selected.some(item => item.id === id) ? theme === 'light' ? 'rgba(220, 248, 198, 0.5)' : 'rgba(7, 94, 84, 0.5)' : 'transparent'}}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ backgroundColor: userIsSender ? brandColors.chat[theme] : theme === 'dark' ? brandColors.primary[theme] : Colors[theme].background, paddingHorizontal:8, paddingVertical:6,  borderRadius: 10, justifyContent: 'center', maxWidth: width / 1.3}, animatedStyle]}>
            {
              reply && reply !== 'Empty' &&
              <View style={{borderRadius: 8, width: '100%', backgroundColor: reply.senderId !== currentUser.uid ? brandColors.homeGreen[theme] : brandColors.blueColor}}>
                  <View style={{ marginLeft: 5, flexDirection: 'row', justifyContent: 'space-between',backgroundColor: userIsSender ? brandColors.chat[theme] : theme === 'dark' ? brandColors.primary[theme] : Colors[theme].background, paddingHorizontal: 6, gap: 10  }}>   
                      <View>
                          <DefaultText style={{fontSize: FontSize.heading, color: reply.senderId !== currentUser.uid ? brandColors.homeGreen[theme] : brandColors.blueColor}}>{reply.senderId === currentUser.uid ? 'You' : sender.knownName ?? sender.username}</DefaultText> 
                          <Text type={'regular'} full={true} style={{ fontSize: FontSize.regular }}>{ reply.type === 'text' ? reply.text.length > 100 ? reply.text.slice(0,97) + '...' : reply.text : reply[reply.type].text ?? reply.type}</Text>
                      </View>
                          {
                              reply.type === 'image' || reply.type === 'video' ?
                              <Image placeholder={blurhash}  source={reply.type === 'image' ? reply.image.url : require('../assets/images/video.gif')} style={{width: 50, height: 50, borderTopRightRadius: 10, borderBottomRightRadius: 10}} />: ''
                          }
                  </View>
              </View>
            }
        {
          type === 'text' &&
          <TouchableWithoutFeedback onPress={decide} onLongPress={handleLongPress}>
              <View>
                  <HighLightText style={{ fontSize: FontSize.regular }} full={true} text={text} query={query} />
                <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 2, ...styles.timestamp}}>
                  <Text style={{ fontSize: FontSize.extreme }} type={'regular'} >{formatTime(timestamp)}</Text>
                {
                  userIsSender ?
                  seen ?
                    <Ionicons name="checkmark-done-outline" size={14} color={brandColors.blueColor} />
                    :
                      <AntDesign name="check" size={14} color={Colors[theme].regularText} />
                    :
                    ''
                }    
                </View>
           </View>
          </TouchableWithoutFeedback>
        }
        {
          type === 'image' && 
            <>
              <TouchableWithoutFeedback onPress={decide} onLongPress={handleLongPress}>
                 <Image
                  style={{width: width / 1.7, height: 300}}
                  source={image.url}
                  placeholder={{ blurhash }}
                  contentFit="cover"
                  transition={1000}
          /> 
              </TouchableWithoutFeedback>
          {image.text && <HighLightText style={{ fontSize: FontSize.regular }} text={image.text} query={query} />}
            <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 2, ...styles.timestamp, position :'absolute', bottom: 8, right: 15}}>  
                  <Text style={{ fontSize: FontSize.extreme }} type={'regular'} full={true}>{formatTime(timestamp)}</Text>
                {
                  userIsSender ?
                  seen ?
                    <Ionicons name="checkmark-done-outline" size={14} color={brandColors.blueColor} />
                    :
                      <AntDesign name="check" size={14} color={Colors[theme].regularText} />
                    :
                    ''
                }    
                </View>
          </>
        }
        {
          type === 'video' &&
            <>
            <TouchableWithoutFeedback onPress={decide} onLongPress={handleLongPress}>
              <Image
                style={{width: width / 1.7, height: 300}}
                source={require('../assets/images/video.gif')}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
                /> 
              </TouchableWithoutFeedback>
              {video.text && <HighLightText style={{ fontSize: FontSize.regular }} full={true} text={video.text} query={query} />
              }
            <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 2, ...styles.timestamp, position :'absolute', bottom: 8, right: 15}}>
                  <Text style={{ fontSize: FontSize.extreme }} type={'regular'}>{formatTime(timestamp)}</Text>
                {
                  userIsSender ?
                  seen ?
                    <Ionicons name="checkmark-done-outline" size={14} color={brandColors.blueColor} />
                    :
                      <AntDesign name="check" size={14} color={Colors[theme].regularText} />
                    :
                    ''
                }    
                </View>
          </>
          }
          {
            type === 'audio' &&
            <TouchableWithoutFeedback onPress={decide} onLongPress={handleLongPress}>
            <View>
            <View style={{flexDirection: 'row', alignItems :'center'}}>
                <View style={{ position: 'relative'}}>
                  <Image
                  style={{width: 40, height: 40, borderRadius: 20}}
                  source={userIsSender ? userInfo.imageUrl : sender.imageUrl}
                  placeholder={{ blurhash }}
                  contentFit="cover"
                  transition={1000}
                  /> 
                  <FontAwesome name="microphone" size={16} color={userIsSender ? Colors.dark.regularText : brandColors.green.dark} style={{position: 'absolute', bottom: 0, right:0}} />
                </View>
                  {
                  playingId === id ? 
                <Foundation name="pause" size={28} color={Colors[theme].regularText} onPress={() =>  pauseSound(id)} style={{marginLeft: 8}} />
                :
                  <Entypo name="controller-play" size={28} color={Colors[theme].regularText} onPress={()=> playSound(id, uri)} style={{marginLeft: 5}} />
                }
                  <Slider
                    style={{width: 180, height: 3}}
                    minimumValue={0}
                    maximumValue={duration[id] ? duration[id] : 1}
                    value={progress[id] ? progress[id] : 0}
                    onValueChange={(value) => updateProgress(id, value)}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor={Colors.dark.regularText}
                    thumbTintColor={userIsSender ? Colors.dark.regularText : brandColors.blueColor}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 8 }}>
                  <Text></Text>
                <Text style={{ fontSize: FontSize.extreme, marginTop: -5, }} type={'regular'}>{duration[id] ? formatPlayingTime(duration[id]) :  '0:00'}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 2, marginTop: -5}}>
                  <Text style={{ fontSize: FontSize.extreme}} type={'regular'}>{formatTime(timestamp)}</Text>
                  {
                    userIsSender ?
                  seen ?
                    <Ionicons name="checkmark-done-outline" size={14} color={brandColors.blueColor} />
                    :
                        <AntDesign name="check" size={14} color={Colors[theme].regularText} />
                      : ''
                }    
                  </View>
                  </View>
                </View>
                </TouchableWithoutFeedback>
          }
        </Animated.View>
        </GestureDetector>
    </View>
  )
}


const styles = StyleSheet.create({
  timestamp: {
    marginTop: -5,
    marginRight: -6
  }
})