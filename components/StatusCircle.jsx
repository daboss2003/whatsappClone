import {  TouchableOpacity, View, useColorScheme } from 'react-native'
import React from 'react'
import { Text } from './Themed'
import { Image } from 'expo-image'
import {blurhash} from '../constants/StaticData'
import { FontSize, brandColors } from '../constants/Colors'
import { AntDesign } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function StatusCircle({ isUser, url, name = '', onPress, id, notEmpty }) {
    const theme = useColorScheme() ?? 'light'
    const addBorder = isUser ? {} : { borderWidth: 2, borderColor: brandColors.homeGreen[theme], borderStyle: 'dashed' }
    const router = useRouter()



    function decide() {
      if (isUser) {
        if (notEmpty) {
          router.navigate('/userStatus')
         }
        else {
          router.navigate({ pathname: '/cameraView', params: { status: true } })
        }  
        }
        else {
            onPress(id)
        }
    }


  return (
    <View style={{gap: 4, position: 'relative'}}>
        <TouchableOpacity onPress={decide} style={{...addBorder, borderRadius: 30}}>
            <Image
            style={{height: 60, width: 60, borderRadius: 30,  }}
            source={url}
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
            />
          </TouchableOpacity>
          {isUser ? notEmpty ? '' : <AntDesign name="pluscircle" size={22} color={brandColors.homeGreen[theme]} style={{position: 'absolute', top: 40, left: 42 }} /> : '' }
          <Text style={{ fontSize: FontSize.extreme }}>{isUser ? 'My status' : name}</Text>
          
    </View>
  )
}