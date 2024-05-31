
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '../../components/Themed'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View , TouchableOpacity, StyleSheet, useColorScheme, Text as DefaultText } from 'react-native'
import { brandColors } from '../../constants/Colors'




export default function Modal() {
  const { code, phone } = useLocalSearchParams()
  const theme = useColorScheme() ?? 'light'
  const router = useRouter()
  return (
    <SafeAreaView style={{flex: 1, paddingHorizontal: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0, 0.4)'}}>
      <View style={{...styles.container, backgroundColor: theme === 'dark' ?  brandColors.primary.light : '#fff'}}>
        <Text type={'regular'} style={{fontSize: 17, marginBottom: 10}}>Is this the correct number?</Text>
        <Text style={{fontSize: 20, marginBottom: 15}}>{`${code} ${phone}`}</Text>
        <View style={{flexDirection: 'row', gap: 10, justifyContent: 'flex-end'}}>
          <TouchableOpacity onPress={ router.back } style={{padding: 15}}>
            <DefaultText style={{color: brandColors.green[theme],fontSize: 17,fontFamily: 'HelveticaBold'}}>Edit</DefaultText>
          </TouchableOpacity>
          <TouchableOpacity style={{padding: 15}} onPress={() => router.replace({pathname: `/(auth)/[phoneNo]`, params: {phoneNo: `${code}${phone}`}})}>
            <DefaultText style={{color: brandColors.green[theme],fontSize: 17, fontFamily: 'HelveticaBold'}}>Yes</DefaultText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    shadowOpacity: 0.4,
    shadowOffset: 4,
    shadowColor: '#333',
    width: '100%'
  }
})