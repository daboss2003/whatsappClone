import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';
import parsePhoneNumber from 'libphonenumber-js'



const fetchContacts = async () => {
   const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
        fields:[ Contacts.Fields.PhoneNumbers, Contacts.Fields.Name]
        });
      if (data.length > 0) {
        const dataObj = []
        for (const item of data) {
          if (item) {
            const { name = 'unknown' } = item;
            let number = 'unknown';
            if (item.phoneNumbers && item.phoneNumbers[0]) {
                number = item.phoneNumbers[0].number
            }
            
            dataObj.push({name, number: formatNumber(number.replace(' ', ''))})
          }
        }
        const result = await search(removeDuplicate(dataObj))
        return result
        }
        else {
        Alert.alert('Empty', 'No contacts');
        }
    }
    else {
        Alert.alert('Failure', 'Unable to access Contacts');
    }
}


export const storeData = async () => {
   const contacts = await fetchContacts()
    try {
        const jsonValue = JSON.stringify(contacts);
        await AsyncStorage.setItem('contacts', jsonValue);
    } catch (e) {
        console.log(e)
    }
};


async function search(dataObj) {
  const finalData = []
  const usersRef = firestore().collection('Users');
    for (const obj of dataObj) {
      try {
        const queryData = await usersRef.where('phoneNo', '==', obj.number).get();
        if (!queryData.empty) {
          queryData.forEach((doc) => {
            const docData = doc.data();
            const marged = { ...docData, knownName: obj.name === 'unknown' ? docData.username : obj.name, uid: doc.id }
            finalData.push(marged);
          })
        }
      }
      catch (error) {
        Alert.alert('Error', error);
      }
    }
    return finalData
}

function formatNumber(number) {
  const parsedNumber = parsePhoneNumber(number, 'NG')
  if (parsedNumber && parsedNumber.isValid()) {
    return  parsedNumber.format('E.164')
  } else {
    return number
  }
}

function removeDuplicate(items) {
  const unique = new Map();
  items.forEach(item => {
    if (!unique.has(item['number'])) {
      unique.set(item['number'], item);
    }
  });
  return Array.from(unique.values());
}