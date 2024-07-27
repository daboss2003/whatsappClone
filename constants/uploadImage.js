import Storage from '@react-native-firebase/storage'
import FireStore from '@react-native-firebase/firestore'
import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native';
import {URL} from 'react-native-url-polyfill'


export async function uploadImage(prevUrl, id) {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });


    if (!result.canceled) {
       const image = result.assets[0].uri;
        const fileName = image.substring(image.lastIndexOf('/') + 1);
        const ref = Storage().ref(`images/${fileName}`);
        const parsedUrl = new URL(prevUrl);
        const pathName = decodeURIComponent(parsedUrl.pathname);
        const filePath = pathName.replace('/v0/b/mobile-chat-58d8b.appspot.com/o/', '').replace('/%2F/g', '/');
        const fileRef = Storage().ref(filePath);
        await fileRef.delete();
        await ref.putFile(image)
        const url = await ref.getDownloadURL()
        const usersCollection = FireStore().collection('Users').doc(id)
        try {
        await usersCollection.update({ imageUrl: url});
        }
        catch (err) {
        Alert.alert('Failure', 'There was a updating your profile image', [
            {
            text: 'Try Again',
            onPress: () => pickImage(),
            style: 'default',
            },
            { text: 'Cancel', onPress: () => console.log('OK Pressed'), style: 'cancel' },
        ]);
        }
    }
    if (result.canceled) {
      Alert.alert('Failure', 'Unable to access image from your device', [
        {
          text: 'Try Again',
          onPress: () => pickImage(),
          style: 'default',
        },
        { text: 'Cancel', onPress: () => console.log('OK Pressed'), style: 'cancel' },
      ]);
    }

    
}