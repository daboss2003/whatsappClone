import { ScrollView, useColorScheme,  Alert, FlatList, View as DefaultView, StyleSheet,  View, Text as DefaultText, ActivityIndicator } from 'react-native'
import React from 'react'
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text} from '../components/Themed'
import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import IconList from '../components/IconList'
import Colors, { FontSize, brandColors } from '../constants/Colors';
import ContactsList from '../components/ContactsList';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { newChat } from '../constants/newChat';
import { sendImageMessage } from '../constants/messageSender';
import { addImageOrVideoStatus } from '../constants/addStatus';
import SearchBar from '../components/SearchBar';
import { filterListByNameAndNumber } from '../constants/filterList';

export default function Selectcontacts() {
    const theme = useColorScheme() ?? 'light'
    const [contact, setContact] = useState([]);
    const { currentUser, connected, userInfo } = useAuth();
    const router = useRouter()
    const [selected, setSelected] = useState([]);
  const { uri, type, text } = useLocalSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [openSearch, setOpenSearch] = useState(false)
  const [filteredArray, setFilteredArray] = useState([]);
  const [loading, setIsloading] = useState(false)

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

  async function openMessage(id, sender) {
    try {
        const chat = await newChat(currentUser.uid, id, connected);
        await sendImageMessage(uri, chat.id, connected, currentUser.uid, type, text, sender, userInfo.username);
    } catch (err) {
      console.log(err)
      Alert.alert('Error', err.message)
    }
    }

    function select(item) {
      const isSelected = selected.some(data => data.uid === item.uid);
        if (isSelected) {
            const newArray = selected.filter(con  => con.uid !== item.uid)
            setSelected(newArray)
        }
        else {
            setSelected(prev => [...prev, item]);
        } 
    }

    
   
    
  async function send() {
      setIsloading(true)
        for (const item of selected) {
            await openMessage(item.uid, item.pushToken || '');
    }
    setIsloading(false)
        router.navigate('/(app)');
  }
  
  async function addStatus() {
    setIsloading(true)
    await addImageOrVideoStatus(currentUser.uid, type === 'picture' ? 'image' : 'video', { url: uri, text: text }, connected);
    setIsloading(false)
     router.navigate('/(app)/updates');
  }


  function filterMyArray(text) {
    setSearchQuery(text)
    setFilteredArray(filterListByNameAndNumber(contact, text));
  }
  
  if (loading) {
    return <ActivityIndicator size={60} style={{justifyContent: 'center', alignItems: 'center', flex: 1}} />
  }
  
  return (
    <View style={{  backgroundColor: Colors[theme].background, flex: 1, padding: 5 }}>
      {openSearch && <SearchBar openSearch={openSearch} setOpenSearch={setOpenSearch} searchQuery={searchQuery} setSearchQuery={filterMyArray} />}
      <ScrollView contentContainerStyle={{flex: 1}}>
      <StatusBar backgroundColor={brandColors.primary[theme]} style='light' /> 
      <Stack.Screen options={{
        title: 'Selct contacts',
          headerRight: () => <MaterialIcons name="search" size={25} color="#fff" onPress={() => setOpenSearch(true)} />,
        headerShown: !openSearch
      }} />
        <DefaultView>
        <IconList title={'My status'} iconName={'camera-iris'} Icon={MaterialCommunityIcons} onPress={addStatus}>
            <Entypo name="dots-three-horizontal" size={24} color={brandColors.homeGreen[theme]} />
        </IconList>
        {contact.length > 0 ?
          <>
             <Text style={{ fontSize: FontSize.regular, marginBottom: 15 }} type={'regular'}>Contacts on WhatsApp</Text>
            <FlatList data={openSearch ? filteredArray : contact} keyExtractor={item => item.uid} renderItem={({item}) => (<ContactsList item={item} onPress={select} multiple={true} selected={selected} />)} scrollEnabled={false}/>
          </>
        : <Text style={{ fontSize: FontSize.regular, marginBottom: 15 }} type={'regular'}> You have no contacts on WhatsApp</Text>}
          </DefaultView>     
      </ScrollView>
      {
              selected.length > 0 && 
             <View style={{ flexDirection: 'row', gap: 10,   }}>
            <FlatList data={selected} keyExtractor={item => item.uid} renderItem={({ item }) => (
              <DefaultText key={item.uid} style={{fontSize: FontSize.regular, marginRight: 6, color: '#fff'}}>{item.knownName ?? item.username}</DefaultText>)}
              style={{flex: 1, flexWrap: 'wrap', padding: 10, backgroundColor: brandColors.primary[theme], borderRadius: 10}} horizontal={true}  />
                <Ionicons name="send" size={24} color="#fff" onPress={send} style={{ padding: 12, borderRadius: 24, backgroundColor: brandColors.homeGreen[theme] }} />
             </View>
          }
      </View>
  )
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