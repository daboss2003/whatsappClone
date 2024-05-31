import { useLocalSearchParams, Link } from 'expo-router'
import { View, Text } from '../../components/Themed'
import React, { useEffect, useState, useRef } from 'react'
import {Text as DefaultText, StyleSheet, useColorScheme, View as DefaultView, Platform, Modal, Alert, TouchableOpacity, ActivityIndicator} from 'react-native'
import { brandColors } from '../../constants/Colors'
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MyButton from '../../components/MyButton'
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar'
import auth from '@react-native-firebase/auth'





const CELL_COUNT = 6;
export default function VerifyOTP() {
  const { phoneNo } = useLocalSearchParams()
  const theme = useColorScheme() ?? 'light'
  const [openModal, setOpenModal] = useState(false)
  const [value, setValue] = useState('');
  const [verification, setVerification] = useState(null);
  const [isLoding, setIsloading] = useState(false)
  const recapchaVerifier = useRef(null);
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });


  useEffect(() => {
    sendCode()
  },[])

  useEffect(() => {
    if (value.length === 6) {
      verifyCode()
    }
  },[value])

  async function sendCode() {
    try {
      setIsloading(true)
      const confirmation = await auth().signInWithPhoneNumber(phoneNo);
      setVerification(confirmation);
      Alert.alert('Success', 'Verification code has been sent to your phone.')
    }
    catch(error){
      Alert.alert('Failed to send verification code.', error.message);
    }
    finally {
      setIsloading(false)
    }
  }


  async function verifyCode() {
    try {
      setIsloading(true)
      await verification.confirm(value)
      Alert.alert('Success','Verification completed')
    }
    catch(err) {
      Alert.alert('Failed to verifiy code.', err.message);
    }
    finally {
      setIsloading(false)
    }
  }

  if (isLoding) {
    <View style={{justifyContent: 'center'}}>
      <ActivityIndicator size={60} style={{marginBottom: 20}} />
      <Text style={{fontSize: 18, textAlign: 'center'}}>Verifying...</Text>
    </View>
  }
 
  return (
    <View>
      <Text type={'regular'} style={{fontSize: 15, textAlign: 'center', letterSpacing: 1,lineHeight: 27}}>
       Waiting to automatically detect an SMS sent to
        <Text>
          {` ${phoneNo}. `}
        </Text>
        <Link href={'/sendOTP'}>
          <DefaultText style={{color: brandColors.blueColor}}>Wrong number?</DefaultText>
        </Link>
      </Text>
        <DefaultView style={styles.root}>
      <CodeField
        ref={ref}
        {...props}
        
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={{...styles.codeFieldRoot, borderColor: 'rgba(0,0,0,0.2)'}}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
        testID="otp-input"
        renderCell={({index, symbol, isFocused}) => (
          <Text
            key={index}
            style={[styles.cell, { borderColor: brandColors[theme]}]}
            onLayout={getCellOnLayoutHandler(index)}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
      </DefaultView>
      <DefaultText style={{ fontSize: 18, color: brandColors.green[theme],  marginTop: 40 }} onPress={() => setOpenModal(true)}>Didn't recieve code?</DefaultText>
      <Modal
        animationType="slide"
        visible={openModal}
        transparent={true}
      >
        <StatusBar backgroundColor='rgba(0,0,0,0.5)' />
        <DefaultView style={styles.modal}>
          <View style={{
            paddingVertical: 20, borderTopRightRadius: 20, borderTopLeftRadius: 20,
            maxHeight: '55%'
           }}>
            <TouchableOpacity style={{width: '100%', justifyContent: 'flex-start'}} onPress={() => setOpenModal(false)}>
              <AntDesign name="close" size={24} color={brandColors[theme]} />
            </TouchableOpacity>
            <DefaultView style={{flex: 1, alignItems: 'center', padding: 15,  width: '100%' }}>
              <DefaultView
              style={{width: 70, height: 70, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: brandColors.green[theme], marginBottom: 20}}>
                <MaterialCommunityIcons name="message-processing" size={26} color="#fff" />
              </DefaultView>
              <Text style={{ fontSize: 22, textAlign: 'center', lineHeight: 32, marginBottom: 15 }}>
                Didn't receive a verification code?
              </Text>
              <Text type={'regular'} style={{ fontSize: 16, textAlign: 'center', lineHeight:  25, marginBottom: 15 }}>
                Please check your SMS messages before requesting another code.
              </Text>
              <MyButton full={true} onPress={sendCode}>
                <MaterialCommunityIcons name="message-processing" size={19} color="#fff" />
                {'  ' }Resend SMS
              </MyButton>
              <MyButton full={true} transparent={true} onPress={() => {
                Alert.alert('Coming Soon!!!', 'Sorry call verification not available now. Thank you for using WhatsApp ')
              }}>
                <MaterialIcons name="call" size={19} color={brandColors.green[theme]} /> {'  '}
                Call me
              </MyButton>
            </DefaultView>
          </View>
        </DefaultView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {paddingHorizontal: 10, alignItems: 'center', width: '80%'},
  codeFieldRoot: {
    gap: 8,
    borderBottomWidth: 2,
    padding: 20,
    width: '80%',
    justifyContent: 'center'
  },
  cell: {
    width: 20,
    height: 30,
    lineHeight: 38,
    fontSize: 24,
    borderBottomWidth: 2,
    textAlign: 'center'
  },
  modal: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    flex: 1,
    
  }
});