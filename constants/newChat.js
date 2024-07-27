import firestore from '@react-native-firebase/firestore'
import uuidv4 from 'react-native-uuid'
import { Chat } from './messageSchema'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function newChat(userID, id, connected) {
  try {
    const allMessages = await AsyncStorage.getItem('allMessages')
    if (allMessages !== null) {
      const all = JSON.parse(allMessages)
      const currentMessage = all.find(item => item.users.includes(userID) && item.users.includes(id));
      if (currentMessage) {
        return currentMessage
      }
    }
  }
  catch (err) {
    console.log(err)
  }
  if(!connected) throw new Error('no internet connection')
  const chatRef = firestore().collection('chats')
  let itExist = true
  try {
    const exist = await chatRef.get()
    if (!exist.empty) {
      const result = exist.docs.map(data => ({ id: data.id, ...data.data() }));
      const message = result.find(item => item.users.includes(userID) && item.users.includes(id));
        if (message) {
          return message
        }
        else {
          itExist = false
        }
      }
  else {
        itExist = false
      }
    if (itExist === false) {
      const documentID = uuidv4.v4();
      const messages = []
      const newChat = new Chat(userID, id, false, messages)
      await chatRef.doc(documentID).set(newChat);
      const query = await chatRef.doc(documentID).get();
      return {id: query.id, ...query.data()}
    }
  }
  catch (err) {
    throw new Error(err)
  }
}

