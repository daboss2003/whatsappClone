import { View, Text } from '../../components/Themed'
import React, { useState } from 'react'
import { brandColors } from '../../constants/Colors'
import ExternalLink from '../../components/ExternalLink'
import { useColorScheme, KeyboardAvoidingView, View as DefaultView, StyleSheet, TouchableOpacity , TextInput, Text as DefaultText, Keyboard} from 'react-native'
import MyButton from '../../components/MyButton'
import CountryPicker from 'react-native-country-picker-modal'
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router'
 
 const PhoneScheme = Yup.object().shape({
   phoneNo: Yup.string().required().min(10, 'Enter your 10 digit phoneNumber').max(10,'PhoneNumer exceeded required length').matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Phone number is not valid.')
 });


export default function SendOTP() {
  const router = useRouter()
  const theme = useColorScheme() ?? 'light'
  const [modalOpen, setModalOpen] = useState(false);
  const [country, setCountry] = useState({
    callingCode: '234',
    cca2: "NG",
    name: "Nigeria",
  });
const [inputBorderWidth, setInputBorderWidth] = useState(1)
 

  function onSelect(country) {
    setCountry(country)
    setModalOpen(false);
  }

  function submitPhoneNo(phone) {
    Keyboard.dismiss()
    router.push({pathname: '/modal', params: { phone: phone.phoneNo , code: country.callingCode }})
  }
  return (
    <View>
      <Text type={'regular'} style={styles.text}>
          WhatsApp will need verify your phone number. Carrier charges may apply.
          <ExternalLink href={'https://www.whatsapp.com'} children={" What's my number?"} style={{ color: brandColors.blueColor }} />     
      </Text>
      <TouchableOpacity style={{...styles.dropDown, borderColor: brandColors.green[theme]}} onPress={() => setModalOpen(true)}>
        <Text type={'regular'} style={styles.dropDownText}>{country.name}</Text>
        <Octicons name="triangle-down" size={28} color={brandColors.green[theme]} />
      </TouchableOpacity>
        <Formik
          initialValues={{ phoneNo: '' }}
        onSubmit={values => submitPhoneNo(values)}
        validationSchema={PhoneScheme}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <KeyboardAvoidingView style={{flex: 1, width: '100%', alignItems: 'center'}}>
              <DefaultView style={styles.inputContainer}>
                <DefaultView style={{ ...styles.leftContainer, borderColor: brandColors.green[theme] }}>
                  <AntDesign name="plus" size={15} color={brandColors[theme]} />
                  <Text type={'regular'} style={{fontSize: 18}}>{ country.callingCode}</Text>
                </DefaultView>
                <TextInput
                  onChangeText={handleChange('phoneNo')}
                  onBlur={() => {
                    handleBlur('phoneNo')
                    setInputBorderWidth(1)
                    }
                  }
                  value={values.phoneNo}
                  style={{ ...styles.input, borderColor: brandColors.green[theme],  borderBottomWidth: inputBorderWidth }}
                  placeholder='Phone number'
                keyboardType="phone-pad"
                onFocus={() => setInputBorderWidth(2)}
                />
            </DefaultView>
            {errors.phoneNo && touched.phoneNo ? 
              <DefaultText style={{fontSize: 16, color: 'red', marginVertical: 10}}>{ errors.phoneNo}</DefaultText>
            : ''}
              
              <DefaultView style={{flex: 1}}></DefaultView>
              <MyButton full={true} onPress={handleSubmit}>Next</MyButton>
            </KeyboardAvoidingView>
          )}
        </Formik>
      <CountryPicker
        visible={modalOpen}
        onSelect={onSelect}
        theme={theme}
        countryCode={country.cca2}
        withFlag={true}
        withEmoji={true}
        withFilter={true}
        withFlagButton={false}
        onClose={() => setModalOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    lineHeight: 27,
     letterSpacing: 1,
    textAlign: 'center',
    fontSize: 16
  }, 
  dropDown: {
    width: '75%',
    flexDirection: 'row',
    borderBottomWidth: 1,
    padding: 5,
    marginTop: 15,
    marginBottom: 5
  },
  dropDownText: {
    flexBasis: '95%',
    fontSize: 18,
    textAlign: 'center'
  },
  input: {
    flexBasis: '62%',
    fontSize: 18,
    paddingBottom: 3
  },
  inputContainer: {
    flexDirection: 'row',
    width: '75%',
    justifyContent: 'space-between',
    marginVertical: 5,
    alignItems: 'center'
  },
  leftContainer: {
    flexDirection: 'row',
    gap: 4,
    flexBasis: '30%',
    borderBottomWidth: 1,
    paddingBottom: 3,
    alignItems: 'center'
  }
})