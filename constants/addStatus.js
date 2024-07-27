import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { Alert } from 'react-native'
import { Status } from './statusSchema'


const statusRef = firestore().collection('status')

export async function addImageOrVideoStatus(userID, type, payload, connected) {
    if (!connected) {
        Alert.alert('Offline', 'No internet connection')
        return
    }
    
    const fileRef = storage().ref(`status/${new Date().toISOString()}`)
    try {
        await fileRef.putFile(payload.url)
        const url = await fileRef.getDownloadURL()
        const statusData = new Status(userID, type, { url, text: payload.text });
        await statusRef.add(statusData)
    }
    catch (err) {
        console.log(err)
    }
}

export async function addTextStatus(userID, payload, connected) {
    if (!connected) {
        Alert.alert('Offline', 'No internet connection')
        return
    }
    try {
        const statusData = new Status(userID, 'text', payload);
        await statusRef.add(statusData);
    }
    catch (err) {
        console.log(err)
    }
}