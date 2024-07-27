import { ScrollView, useColorScheme, Linking, Alert, FlatList, View as DefaultView, StyleSheet, Text as DefaultText, View, ActivityIndicator } from 'react-native'
import React, { useRef } from 'react'
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../components/Themed'
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import IconList from '../components/IconList'
import Colors, { FontSize, brandColors } from '../constants/Colors';
import ContactsList from '../components/ContactsList';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { StatusBar } from 'expo-status-bar';
import { storeData } from '../constants/fetchContacts';
import ExternalLink from '../components/ExternalLink'
import { useAuth } from '../hooks/useAuth';
import { newChat } from '../constants/newChat';
import SearchBar from '../components/SearchBar';
import { filterListByNameAndNumber } from '../constants/filterList';

export default function contacts() {
  const theme = useColorScheme() ?? 'light'
  const [contact, setContact] = useState([]);
  const { currentUser, connected } = useAuth();
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [openSearch, setOpenSearch] = useState(false)
  const [loading, setLoading] = useState(false)
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

  async function openMessage(id) {
    try {
      setLoading(true)
      const chat = await newChat(currentUser.uid, id, connected);
      const jsonValue = JSON.stringify(chat);
      await AsyncStorage.setItem('currentMessage', jsonValue);
      setLoading(false)
      router.replace('/chat')
    } catch (err) {
      console.log(err)
      setLoading(false)
      Alert.alert('Error', err.message)
    }
  }
  
  function filterMyArray(text) {
    setSearchQuery(text)
    setFilteredArray(filterListByNameAndNumber(contact, text));
 }

  
  if (loading) {
    return <ActivityIndicator size={60} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} />
  }
  
  return (
    <>
      <Stack.Screen options={{
        headerTitle: () => <Title length={contact.length} />,
        headerRight: () => <HeaderRightButtons setOpenSearch={setOpenSearch} />,
        headerShown: !openSearch
      }} />
    <View style={{ backgroundColor: Colors[theme].background, flex: 1, padding: 15 }}>
      {openSearch && <SearchBar openSearch={openSearch} setOpenSearch={setOpenSearch} searchQuery={searchQuery} setSearchQuery={filterMyArray} />}
    <ScrollView>
      <DefaultView>
        <IconList title={'New group'} iconName={'group-add'} Icon={MaterialIcons} onPress={() => null} />
        <IconList title={'New contact'} iconName={'person-add-alt-1'} Icon={MaterialIcons} onPress={openContact}>
          <Ionicons name="qr-code-sharp" size={24} color={brandColors.homeGreen[theme]} />
        </IconList>
        {contact.length > 0 ?
          <>
             <Text style={{ fontSize: FontSize.regular, marginBottom: 15 }} type={'regular'}>Contacts on WhatsApp</Text>
            <FlatList data={openSearch ? filteredArray : contact} keyExtractor={item => item.uid} renderItem={({item}) => (<ContactsList item={item} onPress={openMessage} />)} scrollEnabled={false}/>
          </>
        : <Text style={{ fontSize: FontSize.regular, marginBottom: 15 }} type={'regular'}> You have no contacts on WhatsApp</Text>}
      </DefaultView>
      </ScrollView>
      </View>
      </>
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

export function HeaderRightButtons({setOpenSearch}) {
  const theme = useColorScheme() ?? 'light'
  const menuRef = useRef(null)
  return (
    <DefaultView style={styles.container}>
        <StatusBar backgroundColor={brandColors.primary[theme]} style='light' /> 
        <MaterialIcons name="search" size={25} color="#fff" onPress={() => setOpenSearch(true)} />
        <Menu onSelect={() => menuRef.current.close()} ref={menuRef}>
            <MenuTrigger>
                <Entypo name="dots-three-vertical" size={22} color={'#fff'} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{backgroundColor: theme === 'light' ? '#fff' : brandColors.primary[theme], borderRadius: 10, shadowOffset: 10, shadowColor:  Colors[theme].background, marginTop: 40, gap: 15, padding: 15}}>
              <MenuOption onSelect={() => storeData().then(Alert.alert('Refreshed', 'contacts refreshed if you still dont see you desired contact, restart the app')).catch(err => console.log(err))}>
                <Text style={{ fontSize: FontSize.heading }}>Refresh</Text>
              </MenuOption>
              <MenuOption onSelect={openContact}>
                <Text style={{ fontSize: FontSize.heading }}>Contacts</Text>
              </MenuOption>
              <MenuOption children={<ExternalLink href={'https://www.whatsapp.com'} style={{fontSize: FontSize.heading, color: Colors[theme].text, fontFamily: 'HelveticaBold'}}>Help</ExternalLink>}
              />
            </MenuOptions>
        </Menu>    
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