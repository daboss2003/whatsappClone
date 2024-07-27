import { View, Text, Dimensions, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Image, ImageBackground } from 'expo-image'
import Colors, { FontSize, backgroungImages } from '../constants/Colors'
import { blurhash } from '../constants/StaticData'
import { findUsers } from '../constants/findUsers'
import {formatDuration} from '../constants/formatDate'
import { MaterialIcons } from '@expo/vector-icons'
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../hooks/useAuth'


const { width, height } = Dimensions.get('window')

export default function AudioCallScreen({ callID, userJoined, endCall }) {
    const [reciever, setReciever] = useState(null)
    const [duration, setDuration] = useState(0)
    const interValRef = useRef(null)
    const {currentUser} = useAuth()

    useEffect(() => {
        if (reciever !== null) return
        async function getUsersForCall() {
            try {
                const callRef = await firestore().collection('callHistory').doc(callID).get()
                if (callRef.exists) {
                    const usersArray = callRef.data().calls;
                    const callIngUserId = usersArray.find(item => item !== currentUser.uid)
                    const user = await findUsers(callIngUserId)
                    setReciever(user)
                }
                return
            }
            catch (err) {
                console.log(err)
            }
        }
        getUsersForCall()
    }, [reciever]);

    useEffect(() => {
        if (!userJoined) return
        const intervalId = setInterval(() => {
            setDuration(prev => prev + 1)
        }, 1000);
        interValRef.current = intervalId
        return () => {
            clearInterval(interValRef.current)
        }
    }, [userJoined]);


    if (reciever === null) {
        return <ActivityIndicator size={60} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} />
    }
  return (
      <ImageBackground
          source={backgroungImages.dark}
          placeholderContentFit='cover'
          placeholder={blurhash}
          style={{width, height: height + 50, position: 'absolute', top: 0, left: 0, zIndex: 1000, justifyContent :'space-between', alignItems: 'center'}}
      >
          <StatusBar style='light' backgroundColor={'rgba(0,0,0,0.1)'} />
          <View style={{marginTop: height / 8, gap: 4, justifyContent: 'center', alignItems: 'center'}}>
              <Image placeholder={blurhash} source={reciever.imageUrl} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 5 }} />
              <Text style={{ fontSize: FontSize.heading + 10, color: Colors.dark.text }}>{reciever.knownName || reciever.username}</Text>
              <Text style={{ fontSize: FontSize.regular + 5, color: Colors.dark.regularText }}>{userJoined ? formatDuration(duration)  : 'Ringing' }</Text>
          </View>
      <View style={styles.buttonContainer}>
         <MaterialIcons name="call-end" size={30} color="#fff" style={{padding: 15, borderRadius: 30, backgroundColor: 'red'}} onPress={endCall}/>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
        

  },
})