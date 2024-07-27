import AsyncStorage from '@react-native-async-storage/async-storage'
import firestore from '@react-native-firebase/firestore'

export async function StoreKnownUsers(id) {
    try {
        const contacts = await AsyncStorage.getItem('contacts')
        if (contacts !== null) {
            const data = JSON.parse(contacts)
            const isExist = data.some(item => item.uid === id)
            if (isExist) return
        }
        const knownUsersArray = await AsyncStorage.getItem('knownUsers')
        if (knownUsersArray !== null) {
            const prevObj = JSON.parse(knownUsersArray)
            const exist = prevObj.some(item => item.uid === id)
            if (exist) return
            }
        const userRef = await firestore().collection('Users').doc(id).get()
        if (userRef.exists) {
            const userdata = { uid: userRef.id, ...userRef.data() };
            const knownUsers = await AsyncStorage.getItem('knownUsers')
            if (knownUsers !== null) {
                const prevObj = JSON.parse(knownUsers)
                const jointData = [userdata, ...prevObj]
                await AsyncStorage.setItem('knownUsers', JSON.stringify(jointData))
                return
            }
            else {
                await AsyncStorage.setItem('knownUsers', JSON.stringify([userdata]))
                return
            }
        }
    }
    catch (err) {
        console.log(err + 'sdhj')  
    }
}   