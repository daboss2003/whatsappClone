import { View, Text } from '../../components/Themed'
import React, { useState } from 'react'
import { View as DefaultView, FlatList, Modal, ScrollView, useColorScheme, StyleSheet, TouchableNativeFeedback, Text as DefaultText } from 'react-native'
import { Feather } from '@expo/vector-icons';
import Colors, { FontSize, brandColors } from '../../constants/Colors';
import { bussiness, modalData, previewData } from '../../constants/StaticData';
import MyButton from '../../components/MyButton'
import ListItem from '../../components/ListItem'
import { Entypo } from '@expo/vector-icons';







export default function Tools() {
  const theme = useColorScheme() ?? 'light'
  const [openModal, setOpenModal] = useState(false)
  
  return (
     
        <ScrollView style={{ backgroundColor: Colors[theme].background, ...styles.container}} nestedScrollEnabled >
          <DefaultView style={{flexDirection: 'row', gap: 6, alignItems: 'center',  marginBottom: 10 }}>
          <Text type={'regular'} style={{fontSize: FontSize.heading}}>Last 7 days performance</Text>
          <Feather name="info" size={20} color={ Colors[theme].regularText} onPress={ () => setOpenModal(true)} />
        </DefaultView>
        <DefaultView style={{flexDirection: 'row', gap: 10, marginBottom: 10}}>
          {previewData.map(item => (
            <DefaultView key={item.text} style={{padding: 10, borderRadius: 10, borderWidth: 0.9, borderColor:'#ddd', flex: 1, gap:6,}}>
              {item.icon(theme === "light" ? brandColors.primary[theme] :Colors[theme].regularText)}
              <Text style={{fontSize: FontSize.heading}}>{item.number}</Text>
              <Text style={{fontSize: FontSize.regular}} type={'regular'}>{ item.text}</Text>
            </DefaultView>
          ))}
        </DefaultView>
        <Text type={'regular'} style={styles.title}>Grow your Business</Text>
        <DefaultView style={{padding: 15, backgroundColor:theme === 'light' ? '#eee' : brandColors.primary[theme], borderRadius: 20, gap: 20, marginBottom: 15}}>
          <DefaultView style={{flexDirection: 'row', gap: 20, alignItems: 'flex-start'}}>
            <DefaultView style={{padding: 10, borderRadius: 20, backgroundColor:'#D9EAFB'}}>
              <Entypo name="megaphone" size={24} color={theme === "light" ?  brandColors.primary[theme] : brandColors.homeGreen[theme]} />
            </DefaultView>
            <DefaultView style={{flex: 1, gap: 8}}>
              <DefaultText style={{fontSize: FontSize.heading, lineHeight: 29, color: Colors[theme].text}}>Create your first ad from NGN1,496.01/day</DefaultText>
              <DefaultText  style={{fontSize: FontSize.regular, lineHeight: 23, color: Colors[theme].regularText}}>Reach potential new customers with an ad that lets people start WhatsApp chats with you</DefaultText>
            </DefaultView>
          </DefaultView>
          <MyButton full={true} children={'Get started'} tool={true}/>
        </DefaultView>
        <Text type={'regular'} style={styles.title}>Business tools</Text>
        <FlatList data={bussiness} keyExtractor={item => item.header} scrollEnabled={false} renderItem={item => <ListItem item={item.item}  />
        } />
         
        
      <Modal visible={openModal} presentationStyle='overFullScreen' transparent={true}>
        <TouchableNativeFeedback onPress={() => setOpenModal(false)}>
          <DefaultView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.1)', padding: 5 }} >
          <View style={{maxHeight: '60%',  borderTopRightRadius: 30, borderTopLeftRadius: 30, padding: 20}}>
            <Text style={{fontSize: 22, marginVertical: 15}}>Performance explained</Text>
            {modalData.map(item => (
              <DefaultView key={item.header} style={{marginBottom: 20, width: '100%'}}>
                <Text style={{fontSize: FontSize.heading}}>{item.header}</Text>
                <Text type={'regular'} style={{fontSize: 16, lineHeight: 25}}>{ item.text}</Text>
              </DefaultView>
            ))}
            <DefaultText style={{marginBottom: 5, width: '100%', fontSize: FontSize.regular, lineHeight: 23, color: Colors[theme].regularText}}>
              Reported numbers may be delayed b up tp 3 days. Measurement data is approximate and represents the minimum possible number of views. Actual numbers may be slightly higher.
            </DefaultText>
            <DefaultText style={{marginBottom: 5, width: '100%', fontSize: FontSize.regular, lineHeight: 23, color: Colors[theme].regularText}}>
              To protect customer privacy, views below 10 are not displayed.
            </DefaultText>
        </View>
        </DefaultView>
        </TouchableNativeFeedback>
      </Modal>
      </ScrollView>  
   
        
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
  },
  title: {
    fontSize: FontSize.heading,
    marginBottom: 10
  }
})