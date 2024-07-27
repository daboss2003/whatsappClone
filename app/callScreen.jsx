import { View, StyleSheet, Alert, SafeAreaView, Dimensions } from 'react-native';
import  AgoraUIKit, { RenderModeType }  from 'agora-rn-uikit';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AudioCallScreen from '../components/AudioCallScreen';


const {width} = Dimensions.get('window')

const callScreen = () => {
  const { channelName, isVideoCall, recieverId, callID } = useLocalSearchParams();
  const router = useRouter()
  const [callRejected, setCallRejected] = useState(false);
  const [userJoined, setJoined] = useState(false)

  const endCall = async () => {
    setJoined(false)
    await firestore().collection('calls').doc(recieverId).delete();

    if (callRejected) {
      await firestore().collection('callHistory').doc(callID).update({missed: true});
      Alert.alert('Call Ended', 'No answer from the user you are trying to call');
    }
    router.navigate('/(app)');
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('calls')
      .doc(recieverId)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          setCallRejected(true)
          endCall()
        }
      });
    return () => unsubscribe()
  }, [recieverId]);



  return (
    <SafeAreaView style={styles.container}>
      <AgoraUIKit
        connectionData={{
          appId: process.env.EXPO_PUBLIC_AGORA_ID,
          channel: channelName,
          token: null
        }}
        rtcCallbacks={{
          EndCall: () => endCall(),
          UserJoined: () => setJoined(true),
          UserOffline: () => {
            Alert.alert('Ofline', 'Lost internet Connectivity');
            endCall()
          }
        }}
        styleProps={{
          videoMode: {
            max: RenderModeType.RenderModeFit,
            min: RenderModeType.RenderModeHidden
          },
          UIKitContainer: { zIndex: 1, opacity: isVideoCall === 'true' ? 1 : 0, width },
        }}
      />
      {
        isVideoCall === 'true'
          ?
          ''
          :
          <AudioCallScreen callID={callID} userJoined={userJoined} endCall={endCall} />
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default callScreen;