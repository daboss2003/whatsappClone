import { View } from '../../components/Themed'
import React, { useState } from 'react'
import { TouchableWithoutFeedback, StyleSheet, Modal, useColorScheme, View as DefaultView, Alert } from 'react-native'
import {Image} from 'expo-image'
import { useAuth } from '../../hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import Colors, { brandColors } from '../../constants/Colors';
import ProfileList from '../../components/ProfileList'
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import * as Yup from 'yup';
import { Link } from 'expo-router';
import Form from '../../components/Form';
import MyButton from '../../components/MyButton';
import { uploadImage } from '../../constants/uploadImage';
import FireStore from '@react-native-firebase/firestore'
import { placeHolder, blurhash } from '../../constants/StaticData';





  const UserNAmeSchema = Yup.object().shape({
    username: Yup.string().min(4, 'username should not be less than 4 characters').max(25, 'username should not exceed 25 characters'),
    about: Yup.string().min(4, 'minimum of 4 characters').max(130, 'maximum of 130 characters')
});

export default function profile() {
  const { userInfo, currentUser, connected } = useAuth()
  const [openModal, SetOpenModal] = useState(false)
  const [toEdit, setToEdit] = useState('userName');
  let { imageUrl, username, about, phoneNo } = userInfo;
  const [emojiOpen, setEmojiOpen] = useState(false)
  if (!imageUrl) {
    imageUrl = placeHolder;
  }

  if (!about) {
    about = 'Hey there! I am using WhatsApp'
  }

  const theme = useColorScheme() ?? 'light'
 
  function edit(Edit) {
    setToEdit(Edit)
    SetOpenModal(true)
  }

  

 

  async function submit(data) {
    SetOpenModal(false)
    if (!connected) {
      Alert.alert('No Connection', 'check your internet connection')
      return
    } 
     const usersCollection = FireStore().collection('Users').doc(currentUser.uid)
    try {
      await usersCollection.update({[toEdit]: data[toEdit]});
    }
    catch (err) {
      Alert.alert('Failure', `There was a problem updating your ${toEdit}`, [
        {
          text: 'Try Again',
          onPress: () => pickImage(),
          style: 'default',
        },
        { text: 'Cancel', onPress: () => console.log('OK Pressed'), style: 'cancel' },
      ]);
    }
  }
  return (
    <View>
      <DefaultView style={{position: 'relative', marginBottom: 15}}>
        <Link href={{pathname:'/ImageScreen', params:{headerTitle: 'Profile photo', image: imageUrl}}}>
        <Image
          style={styles.image}
          source={imageUrl}
          placeholder={{ blurhash }}
          contentFit="cover"
            transition={1000}
        />
      </Link>
        <FontAwesome name="camera" size={24} color={theme ==='light' ? '#fff' : '#333'} style={{backgroundColor: brandColors.homeGreen[theme], ...styles.imageButton}}  onPress={() => uploadImage(imageUrl,currentUser.uid )} />
      </DefaultView>
      <ProfileList title={'Name'} content={username} edit={true} info={'This is not your username or pin. This name will be visible to your WhatsApp contacts.'} Icon={<Ionicons name="person" size={24} color={Colors[theme].regularText} />} onPress={() => edit('username')} />
      <ProfileList title={'About'} content={about} edit={true} Icon={<Feather name="info" size={24} color={Colors[theme].regularText} />} onPress={() => edit('about')} />
      <ProfileList title={'Phone'} content={phoneNo} onPress={() => null} Icon={<FontAwesome name="phone" size={24} color={Colors[theme].regularText} />} />
      <Modal visible={openModal} transparent={true} presentationStyle='overFullScreen' animationType='slide'>
        <TouchableWithoutFeedback onPress={() => SetOpenModal(false)} >
          <DefaultView style={{ justifyContent: emojiOpen ? 'center' : 'flex-end',  flex: 1}}>
            <Form schema={UserNAmeSchema} object={{field: toEdit, value: toEdit === 'username' ? username : about}} onSubmitForm={submit} max={toEdit === 'username' ? 25 : 130} buttonText={'Save'} button={<MyButton onPress={() =>SetOpenModal(false)} text={true} >Cancel</MyButton>} style={{ backgroundColor: theme === 'light' ? Colors[theme].background : brandColors.primary[theme], padding: 20, borderTopRightRadius: 20, borderTopLeftRadius: 20  }} greenType={'homeGreen'} home={true} emojiAware={setEmojiOpen} />
          </DefaultView>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignContent: 'center',
    
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#0553'
  },
  imageButton: {
    padding: 12,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 100,
    top: 100
  }


})
  
  


    
      
