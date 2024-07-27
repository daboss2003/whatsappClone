import {  Text } from '../../components/Themed'
import React, { useEffect, useMemo, useState } from 'react'
import { Entypo, FontAwesome, MaterialIcons, AntDesign } from '@expo/vector-icons';
import FAB from '../../components/FAB';
import { useRouter } from 'expo-router';
import Colors, { FontSize, brandColors } from '../../constants/Colors';
import { FlatList, ScrollView, useColorScheme, View, Text as DefaultText , TouchableHighlight, StyleSheet, Alert} from 'react-native';
import { useAuth } from '../../hooks/useAuth'
import { sortStatus, sortUserStatus } from '../../constants/sortStatus'
import firestore from '@react-native-firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusCircle from '../../components/StatusCircle';
import { blurhash } from '../../constants/StaticData';
import { formatDate } from '../../constants/formatDate';
import {useSearchProvider} from '../../hooks/useSearchProvider'
import SearchBar from '../../components/SearchBar';
import { filterListByNameAndNumber } from '../../constants/filterList';
import { Image } from 'expo-image';




export default function Updates() {
  const router = useRouter()
  const theme = useColorScheme() ?? 'light'
  const {  userInfo, currentUser, connected } = useAuth()
  const [status, setStatus] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [userToFollow, setUserToFollow] = useState([])
  const { openSearch, setOpenSearch } = useSearchProvider()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredArray, setFilteredArray] = useState([]);
  const [userStatus, setUserStatus] = useState([]);

  
  
  

  useEffect(() => {
    async function fetchUsers() {
      const users = await firestore().collection('Users').get()
      setUserToFollow(users.docs.map(item => ({ ...item.data() })));
    }
    fetchUsers()
  }, []);


  useEffect(() => {
    async function getContacts() {
      const contact = await AsyncStorage.getItem('contacts');
      if (contact !== null) {
         setContacts(JSON.parse(contact));
      }
    }
    getContacts()
  }, []);
  
  const memoisedContacts = useMemo(() => contacts, [contacts]);

  useEffect(() => {
    if(!connected) return
    if (!memoisedContacts || memoisedContacts.length <= 0) return 
    const statusRef = firestore().collection('status')
    const subscribe = statusRef.onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const statusArray = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
        setUserStatus(sortUserStatus(statusArray, currentUser.uid))
        storeData(sortUserStatus(statusArray, currentUser.uid), 'userStatus')
        setStatus(sortStatus(statusArray, memoisedContacts).filter(item => item.uid !== currentUser.uid));
        storeData(sortStatus(statusArray, memoisedContacts).filter(item => item.uid !== currentUser.uid), 'status')
      }
    },
      (error) => {
          Alert.alert('NetWork Error', error.message)
      }
    );

    return subscribe
  }, [memoisedContacts, connected]);

  const storeData = async (value, name) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(name, jsonValue);
  } catch (e) {
    console.log(e)
  }
  };

  useEffect(() => {
    if (connected) return
    AsyncStorage.getItem('status').then(data => data != null ? setStatus(JSON.parse(data)) : setStatus([])).catch(err => console.log(err));
    AsyncStorage.getItem('userStatus').then(data => data != null ? setUserStatus(JSON.parse(data)) : setUserStatus([])).catch(err => console.log(err));
  }, [connected]);
  
  function filterMyArray(text) {
    setSearchQuery(text)
    setFilteredArray(filterListByNameAndNumber(status, text));
 }

  return (
    <View style={{ backgroundColor: Colors[theme].background, flex: 1 }}>
   {openSearch && <SearchBar openSearch={openSearch} setOpenSearch={setOpenSearch} searchQuery={searchQuery} setSearchQuery={filterMyArray} />}
    <ScrollView style={{ padding: 15,  }} >
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={{fontSize: FontSize.heading}}>Status</Text>
        <Entypo name="dots-three-vertical" size={20} color={Colors[theme].text} />
      </View>


      <ScrollView contentContainerStyle={{ padding: 10, paddingRight: 0, borderBottomWidth: 0.7, borderBottomColor: brandColors.underlay[theme], gap: 12 }} horizontal>
        <StatusCircle url={userInfo.imageUrl} isUser={true} notEmpty={userStatus.length > 0 ? true : false} />
        <FlatList
          scrollEnabled={false}
          data={openSearch ? filteredArray : status}
          keyExtractor={item => item.uid}
            renderItem={({ item }) => (<StatusCircle url={item.imageUrl} name={item.knownName ?? item.username} id={item.index} onPress={(index) => router.navigate({ pathname: '/statusDisplay', params: { index: index } })} />)}
            
        />
      </ScrollView>

      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10}}>
        <Text style={{fontSize: FontSize.heading}}>Channels</Text>
        <AntDesign name="plus" size={20} color={Colors[theme].text} />
      </View>

      <CopyOfMessageList name={'WhatsApp'} text={'Game Time!!! Where are you watching'} image={require('../../assets/images/whatsappLogo.webp')} />
      <CopyOfMessageList name={'Mark Zuckerberg'} text={'And, Meta Verified on WhatsApp'} image={require('../../assets/images/zuckerberg.jpg')} />

      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10}}>
        <Text style={{fontSize: FontSize.heading}}>Find channels</Text>
        <View style={{gap: 6, flexDirection: 'row', alignItems: 'center'}}>
          <DefaultText style={{ color: brandColors.homeGreen[theme], fontSize: FontSize.regular }}>See all</DefaultText>
          <Entypo name="chevron-small-right" size={24} color={brandColors.homeGreen[theme]} />
        </View>
      </View>

      <FlatList
        data={userToFollow}
        key={item => item.username + item.phoneNo}
          horizontal
        ItemSeparatorComponent={<View style={{width: 15}} />}
        renderItem={({ item }) => <RandomFollow image={item.imageUrl} name={item.username} />}
        />
        </ScrollView>

      <Entypo name="edit" size={24} color={theme === 'light' ? brandColors.primary.dark : '#58656e'} style={{backgroundColor: theme === 'light' ? '#deedf3' : '#46525f', padding: 8, borderRadius: 8, position: 'absolute', right: 24, bottom: 90, elevation: 6}} onPress={() => router.navigate('/addStatus')} /> 
      <FAB Icon={FontAwesome} name={'camera'} onPress={() => router.navigate({ pathname: 'cameraView', params: { status: true } })} decrease={true} />
      <View style={{flex: 1}}></View>
     </View>
  )
}

function CopyOfMessageList({ image, name, text }) {
  
  const theme = useColorScheme() ?? 'light'

  return (
      <TouchableHighlight underlayColor={brandColors.underlay[theme]} onPress={() => null} style={{marginBottom: 5, width: '100%', padding: 10}}>
      <View style={{ flexDirection: 'row', gap: 15, flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start' , marginRight: 10 }}>
            <Image
            style={{width: 50, height: 50, borderRadius: 25}}
            source={image}
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
      />
            <View style={{flexBasis: '80%'}}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: FontSize.heading, flexBasis: '85%' }}>{ name }</Text>
                <DefaultText style={{fontSize: FontSize.extreme, color:  Colors[theme].regularText}}>{ formatDate(new Date().toISOString())}</DefaultText>  
              </View>
             <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: FontSize.regular, flexBasis: '80%' }} type={'regular'}>{text }</Text> 
              </View>
            </View> 
        </View>
    </TouchableHighlight>
  )
}

function RandomFollow({image, name }) {
  const theme = useColorScheme() ?? 'light'

  return (
    <View style={{padding: 15, borderRadius: 15, gap: 13, alignItems: 'center', borderWidth: 0.8, borderColor: brandColors.underlay[theme]}}>
      <View style={{ position: 'relative' }}>
        <Image
            style={{width: 50, height: 50, borderRadius: 25}}
            source={image}
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
      />
        <MaterialIcons name="verified" size={24} color={brandColors.homeGreen.light} style={{ padding: 1, borderRadius: 20, backgroundColor: Colors[theme].background, position: 'absolute', bottom: -10, right: -10 }} />
      </View>
      
      <Text style={{ fontSize: FontSize.regular }}>{name.split(' ')[0]}</Text>
      <TouchableHighlight style={{borderRadius: 20, paddingVertical: 5, paddingHorizontal: 30, backgroundColor: theme === 'light' ? '#d7dddf' : '#0e2f30'}} underlayColor={brandColors.underlay[theme]}>
        <Text style={{ fontSize: FontSize.regular, textAlign: 'center' }}>Follow</Text>
      </TouchableHighlight>
    </View>
  )
}
