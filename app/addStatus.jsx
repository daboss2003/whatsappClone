import { View, KeyboardAvoidingView, TextInput, Keyboard, useColorScheme, Dimensions, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { brandColors, randomColors } from '../constants/Colors'
import { useRouter } from 'expo-router';
import { AntDesign, Entypo, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { addTextStatus } from '../constants/addStatus';
import { useAuth } from '../hooks/useAuth';
import {RenderEmoji} from './chat'


const { width, height } = Dimensions.get('window')
 

export default function addStatus() {
    const [color, setColor] = useState(randomColors[Math.floor(Math.random() * randomColors.length)]);
    const [input, setInput] = useState('')
    const [showEmoji, setShowEmoji] = useState(false)
    const inputRef = useRef(null)
    const theme = useColorScheme() ?? 'light'
    const {currentUser, connected} = useAuth()

    useEffect(() => {
        if (showEmoji) {
            Keyboard.dismiss()
        }
        else {
            inputRef.current.focus()
        }
    }, [showEmoji]);

    const router = useRouter()

    async function sendStatus() {
        await addTextStatus(currentUser.uid, { color, text: input }, connected);
        router.back();
    }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={{backgroundColor: color, flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', position: 'relative', maxHeight: showEmoji ? height / 1.3 : height + 50}}>
          <StatusBar style='light' backgroundColor='rgba(0,0,0,0.3)' /> 
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={(value) => setInput(value)}
            placeholder='Type a status'
            placeholderTextColor={'rgba(255,255,255,0.4)'}
            keyboardAppearance={theme}
            keyboardType='default'
            multiline
            cursorColor={brandColors.homeGreen[theme]}
            style={{fontSize: 35, color: '#fff', minWidth: '50%', height: '50%'}}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, position: 'absolute', top: 20, left: 0, width, backgroundColor: 'rgba(0,0,0,0)', alignItems: 'center' }}>
              <AntDesign name="close" size={24} color='#fff' onPress={router.back} />
              <View style={{flexDirection: 'row', gap: 20, alignItems:'center'}}>
                  {
                      showEmoji
                          ?
                          <FontAwesome6 name="keyboard" size={24} color="#fff" onPress={() => setShowEmoji(false)} />
                          :
                          <Entypo name="emoji-happy" size={24} color="#fff" onPress={() => setShowEmoji(true)} />
                  }
                  <MaterialCommunityIcons name="format-text" size={24} color="#fff" />
                  <Ionicons name="color-palette-outline" size={24} color="#fff" onPress={() => setColor(randomColors[Math.floor(Math.random() * randomColors.length)])} />
              </View>
          </View>
          { input && <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10, position: 'absolute', bottom: 0, left: 0, width, backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <MaterialCommunityIcons name="send" size={24} color="#fff" onPress={sendStatus} style={{ padding: 12, borderRadius: 24, backgroundColor: brandColors.homeGreen[theme] }} />
          </View>}
          <RenderEmoji showEmoji={showEmoji} setShowEmoji={setShowEmoji} setTextMessage={setInput} />
        </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}