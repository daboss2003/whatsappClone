import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore'

export async function findUsers(senderID) {
    try {
        const contacts = await AsyncStorage.getItem('contacts')
        const parsedData = JSON.parse(contacts)
        
        const senderData = parsedData.find(item => item.uid === senderID);
        if (senderData) {
            return senderData;
        }
        else {
            const knownUsers = await AsyncStorage.getItem('knownUsers')
            const parsedData = JSON.parse(knownUsers)
            
            const senderData = parsedData.find(item => item.uid === senderID);
            if (senderData) {
                return senderData;
            }
            else {
                const userRef = firestore().collection('Users').doc(senderID)
                const data = await userRef.get()
                if (data.exists) {
                    return { uid: data.id, ...data.data() }
                }
            }
        }
    }
    catch (err) {
        console.log(err)
    }
}
