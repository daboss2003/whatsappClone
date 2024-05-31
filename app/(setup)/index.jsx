import { View, Text } from '../../components/Themed'
import React, { useState } from 'react'
import Storage from '@react-native-firebase/storage'
import FireStore from '@react-native-firebase/firestore'
import * as ImagePicker from 'expo-image-picker'
import { TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Alert, Text as DefaultText, useColorScheme, View as DefaultView, TextInput, ActivityIndicator } from 'react-native'
import MyButton from '../../components/MyButton'
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router'
import Colors,{ brandColors } from '../../constants/Colors'
import { useAuth } from '../../hooks/useAuth'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';


const UserNAmeSchema = Yup.object().shape({
   userName: Yup.string().required().min(4, 'username should not be less than 4 characters').max(25,'username should not exceed 25 characters')
});
 
export default function Index() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const theme = useColorScheme() ?? 'light'
  const [inputBorderWidth, setInputBorderWidth] = useState(1)
  const { currentUser } = useAuth()
 

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

  async function upload(userName) {
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
        phoneNo: currentUser._user.phoneNumber
      });
      setUploading(false)
      router.replace('/(tabs)');
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
    <View>
      <Text>Initializing...</Text>
      <Text type={'regular'}>Please wait a moment</Text>
      <View>
        <Image source={require('../../assets/images/welcome.png')} width={'90%'} height={'40%'} style={{marginVertical: 15}} />
      </View>
      <ActivityIndicator size={40} color={brandColors.green[theme]} />
    </View>
  }
  
  if (!uploading) {
    return (
    <View>
      <Text style={{lineHeight: 24, fontSize: 15, textAlign: 'center', marginTop: -15}} type={'regular'}>Please provide your name and an optional profile photo</Text>
      <TouchableOpacity style={{ ...styles.imagePicker, backgroundColor: theme === 'light' ? '#ddd' : '#999' }} onPress={pickImage}>
        {image
          ?
          <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
          :
          <MaterialCommunityIcons name="camera-plus" size={45} color="#444" />  
        }
      </TouchableOpacity>
       <Formik
        initialValues={{ userName: '' }}
        onSubmit={values => upload(values.userName)}
        validationSchema={UserNAmeSchema}
        >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <KeyboardAvoidingView style={{ flex: 1, width: '100%', alignItems: 'center' }}>
            <DefaultView style={styles.inputContainer}>
              <DefaultView style={{ alignItems: 'center',borderColor: brandColors.green[theme],  borderBottomWidth: inputBorderWidth, gap: 6, flexBasis: '90%', flexDirection: 'row'}}>
                <TextInput
                onChangeText={handleChange('userName')}
                cursorColor={brandColors.green[theme]}
                onBlur={() => {
                  handleBlur('userName')
                  setInputBorderWidth(1)
                  }
                }
                value={values.userName}
                style={{ ...styles.input, color: brandColors[theme] }}
                placeholder='username'
                keyboardType="default"
                onFocus={() => setInputBorderWidth(2)}
                />
                <Text type={'regular'}>{25 - values.userName.length}</Text>
              </DefaultView>
              <Entypo name="emoji-happy" size={24} color={Colors[theme].regularText} />
            </DefaultView>
            {errors.userName && touched.userName ? 
              <DefaultText style={{fontSize: 14, color: 'red', marginVertical: 10, textAlign: 'center'}}>{ errors.userName}</DefaultText>
            : ''}
              
              <DefaultView style={{flex: 1}}></DefaultView>
              <MyButton onPress={handleSubmit}>Next</MyButton>
          </KeyboardAvoidingView>
        )}</Formik>
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
    
  },
  input: {
    flexBasis: '85%'
  },
  inputContainer: {
    gap: 5,
    width: '95%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center', 
  }
})