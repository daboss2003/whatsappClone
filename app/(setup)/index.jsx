import { View, Text } from '../../components/Themed'
import React, { useState } from 'react'
import Storage from '@react-native-firebase/storage'
import FireStore from '@react-native-firebase/firestore'
import * as ImagePicker from 'expo-image-picker'
import { TouchableOpacity, Image, StyleSheet, useColorScheme, View as DefaultView, ActivityIndicator, Alert } from 'react-native'
import * as Yup from 'yup';
import { useRouter } from 'expo-router'
import { FontSize, brandColors } from '../../constants/Colors'
import { useAuth } from '../../hooks/useAuth'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Form from '../../components/Form'


const UserNAmeSchema = Yup.object().shape({
   userName: Yup.string().required().min(4, 'username should not be less than 4 characters').max(25,'username should not exceed 25 characters')
});
 
export default function Index() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const theme = useColorScheme() ?? 'light'
  const { currentUser, connected, userInfo } = useAuth()
  
 

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });


    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
  };

  async function upload(value) {
    if (!connected) {
      Alert.alert('No Connection', 'check your internet connection')
      return
    } 
    const {userName} = value
    setUploading(true)
    let url = ''
    if (image) {
      const fileName = image.substring(image.lastIndexOf('/') + 1);
      const ref = Storage().ref(`images/${fileName}`)
      await ref.putFile(image)
      url = await ref.getDownloadURL()
    }
    const usersCollection = FireStore().collection('Users').doc(currentUser.uid)
    try {
      await usersCollection.set({
        username: userName,
        imageUrl: url,
        createdAt: FireStore.FieldValue.serverTimestamp(),
        phoneNo: currentUser.phoneNumber
      });
      setUploading(false)
      router.replace('/(app)');
    }
    catch (err) {
      console.log(err)
      Alert.alert('Failure', 'There was a problem setting up your account', [
        {
          text: 'Try Again',
          onPress: () => pickImage(),
          style: 'default',
        },
        { text: 'Cancel', onPress: () => console.log('OK Pressed'), style: 'cancel' },
      ]);
    }
  }

  if (uploading) {
    return (
      <View>
        <Text>Initializing...</Text>
        <Text type={'regular'}>Please wait a moment</Text>
        <View>
          <Image source={require('../../assets/images/welcome.png')} style={{marginVertical: 15, width: '90%', height: '40%'}} />
        </View>
        <ActivityIndicator size={20} color={brandColors.green[theme]} />
      </View>
   )
  }

  if (userInfo !== null) {
    router.replace('/(app)')
  }
  
  if (!uploading) {
    return (
    <View>
      <Text style={{lineHeight: 24, fontSize: FontSize.regular, textAlign: 'center', marginTop: -15}} type={'regular'}>Please provide your name and an optional profile photo</Text>
      <TouchableOpacity style={{ ...styles.imagePicker, backgroundColor: theme === 'light' ? '#ddd' : '#999' }} onPress={pickImage}>
        {image
          ?
          <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
          :
          <MaterialCommunityIcons name="camera-plus" size={45} color="#444" />  
        }
      </TouchableOpacity>
        <Form schema={UserNAmeSchema} onSubmitForm={upload} max={25} buttonText={'Next'} greenType={'green'} style={{ flex: 1, width: '100%', alignItems: 'center' }} object={{field: 'userName', value: ''}}>
          <DefaultView style={{flex: 1}}></DefaultView>
       </Form>
    </View>
  )
}
  }
  

const styles = StyleSheet.create({
  imagePicker: {
    marginVertical: 25,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
    
  }
})
