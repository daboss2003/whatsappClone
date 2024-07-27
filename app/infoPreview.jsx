import { Link, useLocalSearchParams } from 'expo-router'
import { Text } from '../components/Themed'
import React,{useEffect} from 'react'
import { ImageBackground } from 'expo-image'
import { blurhash } from '../constants/StaticData'
import { Alert, Dimensions, TouchableWithoutFeedback, useColorScheme,View } from 'react-native'
import Colors, { FontSize, brandColors } from '../constants/Colors'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS, withSpring } from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { newChat } from '../constants/newChat';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { handleStartCall } from '../constants/placeCalls'

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window')

export default function infoPreview() {
    const { name, image, uid, x, y, width, height } = useLocalSearchParams()
    const theme = useColorScheme() ?? 'light'
    const router = useRouter()
  const { currentUser, connected } = useAuth();

  const Pwidth = useSharedValue(parseInt(width));
  const Pheight = useSharedValue(parseInt(height));
  const translateX = useSharedValue(parseInt(x));
  const translateY = useSharedValue(parseInt(y - (deviceHeight / 2)));
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0)
  const radius = useSharedValue(parseInt(width))

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
    width: Pwidth.value,
    height: Pheight.value,
    opacity: opacity.value,
    scale: scale.value,
    borderRadius: radius.value
  }));

  useEffect(() => {
    translateX.value = withSpring(40);
    translateY.value = withSpring( -80);
    Pwidth.value = withSpring(deviceWidth / 1.1);
    Pheight.value = withSpring(deviceWidth);
    opacity.value = withSpring(1);
    scale.value = withSpring(1);
    radius.value = withSpring(0)
  }, []);
    
  
  async function openMessage() {
    try {
      const chat = await newChat(currentUser.uid, uid, connected);
      const jsonValue = JSON.stringify(chat);
      await AsyncStorage.setItem('currentMessage', jsonValue);
      router.push('/chat')
    } catch (err) {
      console.log(err)
      Alert.alert('Error', err.message)
    }
  }

  const handleClose = () => {

    translateX.value = withSpring(parseInt(x))
    translateY.value = withSpring(parseInt(y - (deviceHeight / 2)));
    Pheight.value = withSpring(parseInt(height))
    scale.value = withSpring(1);
    Pwidth.value = withSpring(parseInt(width))
    radius.value = withSpring(parseInt(width))
    opacity.value = withTiming(0, {duration: 500}, () => {
          'worklet'
      runOnJS(router.back)()
    });
  }

  async function voiceCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(false, currentUser.uid, uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    async function videoCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(true, currentUser.uid, uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

  return (
    <TouchableWithoutFeedback onPress={handleClose} style={{flex: 1, width:'100%'}}>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Animated.View style={[ animatedStyle]}>
            <Link href={{pathname: '/contactImageScreen', params: {name, image}}} asChild>
                <TouchableWithoutFeedback>
                    <ImageBackground placeholder={blurhash} placeholderContentFit='cover' source={image.replace('images/', 'images%2F')} style={{width: '80%', height: 300, justifyContent: 'space-between', backgroundColor: '#ddd'}}>
                    <Text style={{ fontSize: FontSize.heading, backgroundColor: brandColors.underlay.light, padding: 6 }}>{name}</Text>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', backgroundColor: Colors[theme].background, padding: 15}}>
                        <MaterialCommunityIcons name="android-messages" size={24} color={brandColors.homeGreen[theme]} onPress={openMessage} />
                        <MaterialIcons name="phone" size={24} color={brandColors.homeGreen[theme]} onPress={voiceCall} />
                        <Feather name="video" size={24} color={brandColors.homeGreen[theme]} onPress={videoCall} />
                  <Feather name="info" size={24} color={brandColors.homeGreen[theme]} onPress={() => currentUser.uid === uid ? router.navigate('/(profile)') : router.navigate({ pathname: '/usersProfile', params: { userID: uid } })} />
                    </View>  
                </ImageBackground>
                </TouchableWithoutFeedback>
            </Link>    
        </Animated.View>
        </View>
    </TouchableWithoutFeedback>
  )
}