import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import uuidv4 from 'react-native-uuid'

export const handleStartCall = async (isVideoCall, callerId, recieverId, connected) => {
    if (!connected) {
        Alert.alert('Offline', 'connect to the internet to send messages')
        return
     }
     try {
         const channelName = `${callerId}-${recieverId}`;
         const callID = uuidv4.v4()
        await firestore().collection('calls').doc(recieverId).set({
            channelName,
            callerId,
            isVideoCall,
            status: 'ringing',
            callID
        });
         const callInfo = {
             calls: [callerId, recieverId],
             caller: callerId,
             reciever: recieverId,
             isVideoCall,
             missed: false,
             timestamp: new Date().toISOString()
         }
         await firestore().collection('callHistory').doc(callID).set(callInfo);

        return { channelName, isVideoCall, callerId, recieverId, callID};
     }
     catch (err) {
         console.log(err)
     }
}