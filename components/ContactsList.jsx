import { View, TouchableHighlight, useColorScheme ,TouchableWithoutFeedback} from 'react-native'
import { Text } from './Themed'
import React, { useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import {useLimitWords} from '../hooks/useLimitWords'
import { FontSize, brandColors } from '../constants/Colors'
import { Image } from 'expo-image'
import {placeHolder} from '../constants/StaticData'
import { useRouter } from 'expo-router'
import { blurhash } from '../constants/StaticData'
import { AntDesign } from '@expo/vector-icons'



export default function ContactsList({ item, onPress, multiple, selected, call }) {
    const theme = useColorScheme() ?? 'light'
    const {limitText, setContainer} = useLimitWords(item.about ?? 'Hey there am using WhatsApp')
    const { currentUser } = useAuth()
    const imageRef = useRef(null)
    const router = useRouter()
  
  function select() {
   
      if (item.uid !== currentUser.uid) {
        if (multiple || call) {
          onPress(item)
        }
        else {
           onPress(item.uid)
        }
      }
    
  }
  
  function getImageSize() {
    if (multiple) return
    if (imageRef.current) {
      imageRef.current.measure((fx, fy, width, height, px, py) => {
      router.navigate({ pathname: '/infoPreview', params: { name: item.knownName ?? item.username, image: item.imageUrl ?? placeHolder, uid: item.uid, x: px, y: py, width, height } })
    });
    }
  }
  return (
    <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={select} style={{marginBottom: 5, width: '100%', padding: 10}}>
        <View style={{ flexDirection: 'row', gap: 15, flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start' }}>
        <TouchableWithoutFeedback onPress={getImageSize}>
          <View ref={imageRef}>
            <Image
                style={{width: 50, height: 50, borderRadius: 25}}
                source={item.imageUrl ?? placeHolder}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
                
            />
            {selected?.some(data => data.uid === item.uid) && <AntDesign name="checkcircle" size={20} color={brandColors.homeGreen[theme]} style={{position: 'absolute', top: 30, left: 35 }} />}
          </View>
        </TouchableWithoutFeedback>
            <View onLayout={(event) => {
            const { width } = event.nativeEvent.layout
            setContainer(width)
              }} style={{flexBasis: '80%'}}>
                <Text style={{ fontSize: FontSize.heading }}>{item.knownName ?? item.username} {item.uid === currentUser.uid && '(You)' }</Text>
                <Text type={'regular'} style={{fontSize: FontSize.regular}}>{ limitText}</Text>  
            </View>  
        </View>
    </TouchableHighlight>
  )
}