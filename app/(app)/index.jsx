import { Alert, Dimensions, FlatList, StyleSheet, TouchableHighlight, useColorScheme, View, ScrollView } from 'react-native';
import { Text } from '../../components/Themed';
import FAB from '../../components/FAB'
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth'
import {  useRouter } from 'expo-router';
import Colors, { FontSize, brandColors } from '../../constants/Colors';
import { useEffect, useRef, useState } from 'react';
import firestore from '@react-native-firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageList from '../../components/MessageList'
import Animated, { useAnimatedStyle, useSharedValue, runOnJS, Easing, withTiming } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { findUsers } from '../../constants/findUsers';
import {useSearchProvider} from '../../hooks/useSearchProvider'
import SearchBar from '../../components/SearchBar';
import { filterForChats } from '../../constants/filterList';



const {width} = Dimensions.get('window')



export default function TabOneScreen() {
  const router = useRouter()
  const theme = useColorScheme() ?? 'light'
  const [directChats, setDirectChats] = useState([]);
  const { currentUser, connected } = useAuth();
  const chatRef = firestore().collection('chats')
  const [selected, setSelected] = useState([])
  const [multiple, setMultiple] = useState(false);
  const { openSearch, setOpenSearch } = useSearchProvider()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredChat, setfilteredChat] = useState([]);





  

  useEffect(() => {
    if (!connected) return
    const query = chatRef.where('users', 'array-contains', currentUser.uid).where('archived', '==', false); 
    const subscribe = query.onSnapshot((snapshot) => {   
      if (!snapshot.empty) {
        const data = snapshot.docs.map(item => ({
        id: item.id, ...item.data()
        })).filter(item => item.messages.length > 0);
        setDirectChats(data);
        saveMessagesToLocalStorage(data)
      }
    },
      (error) => {
          Alert.alert('NetWork Error', error.message)
        }
    );

    return subscribe
  }, [connected]); 


  

  
async function getDataFromLocalStorage() {
    try {
      const data = await AsyncStorage.getItem('allMessages')
      if (data !== null) {
        setDirectChats(JSON.parse(data));
      }
    }
    catch (err) {
      console.log(err)
    }
  }
 
  useEffect(() => {
    if (connected) return
    getDataFromLocalStorage()
  }, [connected]);

  

  async function saveMessagesToLocalStorage(message) {
    try {
      const jsonValue = JSON.stringify(message);
      await AsyncStorage.setItem('allMessages', jsonValue);
    }
    catch (e) {
      console.log(e)
  }
  }

  

  async function openMessage(message) {
   try {
      const jsonValue = JSON.stringify(message);
      await AsyncStorage.setItem('currentMessage', jsonValue);
      router.navigate('/chat')
    } catch (err) {
      console.log(err)
      Alert.alert('Error', err.message)
    }
 }


   function filterMyArray(text) {
    setSearchQuery(text)
    setfilteredChat(filterForChats(directChats, text,currentUser.uid));
   }
  
  return (
   
      <View style={{flex: 1}}>
       {openSearch && <SearchBar openSearch={openSearch} setOpenSearch={setOpenSearch} searchQuery={searchQuery} setSearchQuery={filterMyArray} />}
        {selected.length > 0 && <SelectionHeader selected={selected} setSelected={setSelected} fullList={directChats} setMultiple={setMultiple} />}
        <ScrollView style={{ backgroundColor: Colors[theme].background }} contentContainerStyle={styles.container} underlayColor={brandColors.underlay[theme]}>
      <TouchableHighlight onPress={() => router.navigate('/archived')} underlayColor={brandColors.underlay[theme]} >
        <View style={{flexDirection: 'row', gap: 20, padding: 15, width: '100%', marginBottom: 10}} >
        <MaterialCommunityIcons name="archive-arrow-down-outline" size={24} color={Colors[theme].regularText} />
        <Text style={{fontSize: FontSize.heading}}>Archived</Text>
        </View>
      </TouchableHighlight>
      <FlatList
          data={openSearch ? filteredChat : directChats}
          scrollEnabled={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MessageList chat={item} onPress={openMessage} onPressIn={setSelected} selected={selected} setMultiple={setMultiple} multiple={multiple} />
        )}
      />
      
      </ScrollView>
      <FAB name={'message-plus'} Icon={MaterialCommunityIcons} onPress={() => router.navigate('/contacts')}/>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
   padding: 10,
    justifyContent: 'center',
  }
});


export function SelectionHeader({ selected, setSelected, fullList, setMultiple, type }) {
  const theme = useColorScheme() ?? 'light'
  const router = useRouter()
  const { currentUser, connected } = useAuth()
  const menuRef = useRef(null)
  const {setEnableEdit} = useSearchProvider()

  useEffect(() => {
    setEnableEdit(true)
    return () => {
      setEnableEdit(false)
      setMultiple(false)
    }
  }, []);


  async function openProfile() {
    if (!connected) {
      Alert.alert('Offline', 'connect to the internet to complete this action')
      return
    }
    const senderID = selected[0].users.find(item => item !== currentUser.uid)
    const user = await findUsers(senderID)
    router.navigate({ pathname: '/usersProfile', userID: user.uid });
    setSelected([])
    setMultiple(false)
  }

  async function archive() {
    if (!connected) {
      Alert.alert('Offline', 'connect to the internet to complete this action')
      return
    }
    for (const data of selected) {
     await firestore().collection('chats').doc(data.id).update({ archived: !data.archived });
    }
    setSelected([])
    setMultiple(false)
  }

  async function deleteChat() {
    if (!connected) {
      Alert.alert('Offline', 'connect to the internet to complete this action')
      return
    }
    for (const data of selected) {
     await firestore().collection('chats').doc(data.id).delete();
    }
    setSelected([])
    setMultiple(false)
  }

  const headerWidth = useSharedValue(0)
   const opacity = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    width: headerWidth.value,
     opacity: opacity.value
  }));

 
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    headerWidth.value = withTiming(width, { duration: 1000, easing: Easing.out(Easing.ease) })
  }, []);

  const handleClose = () => {
     opacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
     headerWidth.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }, () => {
       runOnJS(setSelected)([])
       runOnJS(setMultiple)(false)
     }); 
   }
  
   if (!selected || selected.length <= 0) {
        return <View style={{width: 0, height: 0}} />
    }

  return (
    <Animated.View style={[{height: 64, top: 25 , left: 0,  padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', backgroundColor: Colors[theme].background, zIndex: 255, marginBottom: 25 }, animatedStyle]}>
      <StatusBar backgroundColor={Colors[theme].background} style={theme === 'light' ? 'dark' : 'light'} />
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <AntDesign name="arrowleft" size={24} color={Colors[theme].text} onPress={ handleClose} />
        <Text style={{ fontSize: FontSize.heading }}>{selected.length }</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <AntDesign name="delete" size={24} color={Colors[theme].text} onPress={deleteChat} />
        <Menu onSelect={() => menuRef.current.close()} ref={menuRef}>
            <MenuTrigger>
                <Entypo name="dots-three-vertical" size={22} color={Colors[theme].text} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{backgroundColor: theme === 'light' ? '#fff' : brandColors.primary[theme], borderRadius: 10, shadowOffset: 10, shadowColor:  Colors[theme].background, marginTop: 40}}>
                <MenuOption style={{ padding: 10 }} onSelect={archive}>
              <Text style={{ fontSize: FontSize.regular }}>{type === 'archived' ? 'Unarchive chat' : 'Archive chat' }</Text>
                </MenuOption>
                {selected.length === 1 &&
                  <MenuOption style={{ padding: 10 }} onSelect={openProfile}>
                      <Text style={{fontSize: FontSize.regular}}>View Contact</Text>
                  </MenuOption>
                }
                <MenuOption style={{ padding: 10 }} onSelect={() => setSelected(fullList)}>
                  <Text style={{fontSize: FontSize.regular}}>Select all</Text>
                </MenuOption>
            </MenuOptions>
        </Menu> 
      </View>
    </Animated.View>
  )
}