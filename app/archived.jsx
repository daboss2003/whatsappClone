import { Alert, FlatList, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { useAuth } from '../hooks/useAuth'
import {  Stack, useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageList from '../components/MessageList'
import { SelectionHeader } from './(app)';




export default function archived() {
  const router = useRouter()
  const theme = useColorScheme() ?? 'light'
  const [directChats, setDirectChats] = useState([]);
  const { currentUser, connected } = useAuth();
  const chatRef = firestore().collection('chats')
  const [selected, setSelected] = useState([])
  const [multiple, setMultiple] = useState(false);

  
useEffect(() => {
    if (!connected) return
    const query = chatRef.where('users', 'array-contains', currentUser.uid).where('archived', '==', true); 
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


  
  useEffect(() => {
    if (connected) return
    getDataFromLocalStorage()
  }, [connected]);

  async function saveMessagesToLocalStorage(message) {
    try {
      const jsonValue = JSON.stringify(message);
      await AsyncStorage.setItem('archivedMessages', jsonValue);
    }
    catch (e) {
      console.log(e)
  }
  }

  async function getDataFromLocalStorage() {
    try {
      const data = await AsyncStorage.getItem('archivedMessages')
      if (data !== null) {
        setDirectChats(JSON.parse(data));
      }
    }
    catch (err) {
      console.log(err)
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

  return (
    <>
      <Stack.Screen options={{ title: 'Archived', headerShown: selected.length <= 0 }} />
      {
        selected.length > 0 &&
        <SelectionHeader selected={selected} setSelected={setSelected} fullList={directChats} setMultiple={setMultiple} type={'archived'} />
      }
      <ScrollView style={{ backgroundColor: Colors[theme].background }} contentContainerStyle={styles.container}>
      <FlatList
        data={directChats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MessageList chat={item} onPress={openMessage} onPressIn={setSelected} selected={selected} setMultiple={setMultiple} multiple={multiple} />
          )}
        scrollEnabled={false}
      />
    </ScrollView>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  }
});
