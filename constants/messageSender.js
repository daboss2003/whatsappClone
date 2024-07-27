import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { Message } from './messageSchema'
import uuidv4 from 'react-native-uuid'
import { Alert } from 'react-native'

export async function sendTextMessage(text, messageID, userID, connected, replyMessage, token, username) {
    if (connected) {
        const messageRef = firestore().collection('chats').doc(messageID)
        const id = uuidv4.v4()
        const message = new Message(userID, 'text', text, id, replyMessage);
        try {
            await messageRef.update({ messages: firestore.FieldValue.arrayUnion(message) });
            await fetch('https://mobilechatfunctions.netlify.app/.netlify/functions/sendNotifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token, message: text, userName: username, messageId: messageID }),
            });
        }
        catch (err) {
            console.log(err)
        }
    }
    else {
        Alert.alert('Offline', 'connect to the internet to send messages')
    }
}


export async function uploadAudio(uri, messageID, connected, userID, token, username) {
    if (connected) {
        const filename = 'audio/' + new Date().toISOString()
        const ref = storage().ref(`messages/${filename}`);
        const messageRef = firestore().collection('chats').doc(messageID)
        const id = uuidv4.v4()
        try {
            await ref.putFile(uri);
            const url = await ref.getDownloadURL()
            const message = new Message(userID, 'audio', url, id);
            await messageRef.update({ messages: firestore.FieldValue.arrayUnion(message) });
            await fetch('https://mobilechatfunctions.netlify.app/.netlify/functions/sendNotifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token, message: 'audio', userName: username, messageId: messageID }),
                });
        }
        catch (err) {
            console.log(err)
        }
    }
    else {
        Alert.alert('Offline', 'connect to the internet to send messages')
    }
}

export async function sendImageMessage(uri, messageID, connected, userID, type, text, token, username) {
    if (connected) {
        const filename = type + '/' + new Date().toString()
        const ref = storage().ref(`messages/${filename}`);
        const messageRef = firestore().collection('chats').doc(messageID)
        const id = uuidv4.v4()
        try {
            await ref.putFile(uri);
            const url = await ref.getDownloadURL()
            const message = new Message(userID, type === 'picture' || type === 'image' ? 'image' : 'video', { url, text: text }, id);
            await messageRef.update({ messages: firestore.FieldValue.arrayUnion(message) });
            await fetch('https://mobilechatfunctions.netlify.app/.netlify/functions/sendNotifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token, message: text || type, userName: username, messageId: messageID }),
            });
        }
        catch (err) {
            console.log(err)
        }
     }
    else {
        Alert.alert('Offline', 'connect to the internet to send messages')
    }
}

export async function updateSeen(messageID, messages) {
    try {
        const messageRef = firestore().collection('chats').doc(messageID)
        await messageRef.update({ messages: messages });
    }
    catch (err) {
        console.log(err)
    }

}



