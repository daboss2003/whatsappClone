import { ScrollView, useColorScheme, Linking, Alert, FlatList, View as DefaultView, StyleSheet, Text as DefaultText, TouchableWithoutFeedback } from 'react-native'
import React, { useRef } from 'react'
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../components/Themed'
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import IconList from '../components/IconList'
import Colors, { FontSize, brandColors } from '../constants/Colors';
import ContactsList from '../components/ContactsList';
import { Stack,  useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { Image } from 'expo-image';
import { blurhash, placeHolder } from '../constants/StaticData';
import {handleStartCall} from '../constants/placeCalls'
import { filterListByNameAndNumber } from '../constants/filterList';
import SearchBar from '../components/SearchBar';

export default function contacts() {
  const theme = useColorScheme() ?? 'light'
  const [contact, setContact] = useState([]);
  const { currentUser, connected } = useAuth();
  const [selected, setSelected] = useState(null)
  const router = useRouter()
  const imageRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [openSearch, setOpenSearch] = useState(false)
  const [filteredArray, setFilteredArray] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem('contacts');
        if (value !== null) {
          setContact(JSON.parse(value))
        }
      }
      catch (e) {
        console.log(e)
      }
    };
    getData()
  }, []);

    
    function getImageSize() {
       imageRef.current.measure((fx, fy, width, height, px, py) => {
           router.navigate({ pathname: '/infoPreview', params: { name: selected.knownName ?? selected.username, image: selected.imageUrl ?? placeHolder, uid: selected.uid, x: px, y: py, width, height } });
      });
    }
    
    async function voiceCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(false, currentUser.uid, selected.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
    }

    async function videoCall() {
        const { channelName, isVideoCall, callerId, recieverId, callID } = await handleStartCall(true, currentUser.uid, selected.uid, connected);
        router.navigate({ pathname: '/callScreen', params: { callID, isVideoCall, callerId, recieverId, channelName } });
  }
  
  function filterMyArray(text) {
    setSearchQuery(text)
    setFilteredArray(filterListByNameAndNumber(contact, text));
 }

  
  return (
    <DefaultView style={{ backgroundColor: Colors[theme].background, flex: 1 }}>
      { openSearch && <SearchBar openSearch={openSearch} setOpenSearch={setOpenSearch} searchQuery={searchQuery} setSearchQuery={filterMyArray}  />}
      <DefaultView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <Stack.Screen options={{
        headerTitle: () => <Title length={contact.length} />,
        headerRight: () => <HeaderRightButtons setSearch={setOpenSearch} />,
        headerShown: !openSearch
          }} />
          <DefaultView style={{borderBottomColor: brandColors.underlay[theme], borderBottomWidth: 0.8, padding: 15, flexDirection: 'row', gap: 10, alignItems: 'center'}}>
              {
                selected ? 
                      <>
                        <TouchableWithoutFeedback onPress={getImageSize}>
                            <Image
                            style={{width: 50, height: 50, borderRadius: 25}}
                            source={selected.imageUrl ?? placeHolder}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                            transition={1000}
                            ref={imageRef}
                           />
                          </TouchableWithoutFeedback>
                          <DefaultView style={{flex: 2}}>
                              <Text style={{ fontSize: FontSize.heading }}>{selected.knownName ?? selected.username}</Text>
                              <Text style={{ fontSize: FontSize.regular }} type={'regular'}>{selected.about ? selected.about : 'Hey there am using whatsApp!' }</Text>
                          </DefaultView>
                          <DefaultView style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5}}>
                              <MaterialIcons name="call" size={24} color={brandColors.homeGreen[theme]} onPress={voiceCall} style={{padding: 6}} />
                              <Feather name="video" size={24} color={brandColors.homeGreen[theme]} onPress={videoCall} style={{padding: 6}} />
                          </DefaultView>
                      </>
                      :
                      <Text style={{fontSize: FontSize.regular}} type={'regular'}>Select a user to call</Text>
              }
          </DefaultView>
      <ScrollView >
        <IconList title={'New call link'} iconName={'link-2'} Icon={Feather} onPress={() => null} />
        <IconList title={'New contact'} iconName={'person-add-alt-1'} Icon={MaterialIcons} onPress={openContact}>
          <Ionicons name="qr-code-sharp" size={24} color={brandColors.homeGreen[theme]} />
        </IconList>
        {contact.length > 0 ?
          <>
             <Text style={{ fontSize: FontSize.regular, marginBottom: 15 }} type={'regular'}>Contacts on WhatsApp</Text>
            <FlatList data={openSearch ? filteredArray : contact} keyExtractor={item => item.uid} renderItem={({item}) => (<ContactsList item={item} onPress={setSelected} call={true} />)} scrollEnabled={false}/>
          </>
        : <Text style={{ fontSize: FontSize.regular, marginBottom: 15 }} type={'regular'}> You have no contacts on WhatsApp</Text>}
      </ScrollView>
      </DefaultView>
      </DefaultView>
  )
}


function Title({length}) {
  
  return (
    <DefaultView style={{justifyContent: 'center', alignItems: 'flex-start'}}>
      <DefaultText style={{fontSize: FontSize.heading, color: '#fff'}}>Select contact</DefaultText>
      <DefaultText style={{fontSize: FontSize.regular, color: '#fff'}}>{ length} contacts</DefaultText>
    </DefaultView>
  )
}

export function HeaderRightButtons({setSearch}) {
  const theme = useColorScheme() ?? 'light'
  return (
    <DefaultView style={styles.container}>
        <StatusBar backgroundColor={brandColors.primary[theme]} style='light' /> 
        <MaterialIcons name="search" size={25} color="#fff" onPress={() => setSearch(true)}  />
    </DefaultView>
  )
}


export async function openContact() {
    const url = 'content://contacts/people/'
    const supported = Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    }
    else {
      Alert.alert('Something went wrong', 'there was an error opening your device contact please open your contact manually and add the new contact');
    }
}
  

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 18,
    marginHorizontal: 10,
  
    alignItems: 'center',
    justifyContent: 'center'
  }
  
})