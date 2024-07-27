import { StyleSheet, useColorScheme, TouchableHighlight, View, FlatList, Alert, Dimensions, ScrollView } from 'react-native';
import { Text } from '../../components/Themed';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import FAB from '../../components/FAB';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS, Easing, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Colors, { FontSize, brandColors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import CallList from '../../components/CallList';
import { StatusBar } from 'expo-status-bar';
import {useSearchProvider} from '../../hooks/useSearchProvider'
import SearchBar from '../../components/SearchBar';
import { filterForCalls } from '../../constants/filterList';



const {width} = Dimensions.get('window')

export default function TabTwoScreen() {

  const theme = useColorScheme() ?? 'light'
  const router = useRouter()
  const {currentUser, connected} = useAuth()
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState([])
  const [multiple, setMultiple] = useState(false)
  const { openSearch, setOpenSearch } = useSearchProvider()
  const [searchQuery, setSearchQuery] = useState('')
  const callQuery = firestore().collection('callHistory')
  const [filteredHistory, setFilteredHistory] = useState([])

  useEffect(() => {
    if (!connected) return
    const query = callQuery.where( 'calls', 'array-contains', currentUser.uid)
    const subscribe = query.onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(item => ({
        id: item.id, ...item.data()
        }));
        setHistory(data);
        saveHistoryToLocalStorage(data)
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
      const data = await AsyncStorage.getItem('callHistory')
      if (data !== null) {
         setHistory(JSON.parse(data));
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

  async function saveHistoryToLocalStorage(message) {
    try {
      const jsonValue = JSON.stringify(message);
      await AsyncStorage.setItem('callHistory', jsonValue);
    }
    catch (e) {
      console.log(e)
  }
  }

  
  function filterMyArray(text) {
    setSearchQuery(text)
    setFilteredHistory(filterForCalls(history, text,currentUser.uid));
 }


  return (
      <View style={{flex: 1}}>
        {openSearch && <SearchBar openSearch={openSearch} setOpenSearch={setOpenSearch} searchQuery={searchQuery} setSearchQuery={filterMyArray} />}
      {selected.length > 0 && <SelectionHeader selected={selected} setSelected={setSelected} setMultiple={setMultiple} />}
      <ScrollView style={{backgroundColor: Colors[theme].background}} contentContainerStyle={styles.container}>
        <TouchableHighlight onPress={() => null} style={{width: '100%', marginBottom: 5, padding: 10, }} underlayColor={brandColors.underlay[theme]}>
          <View style={{flexDirection: 'row', gap: 15, alignItems: "center"}}>
            <Feather name="link-2" size={24} color="#fff" style={{backgroundColor: brandColors.homeGreen[theme], padding: 15, borderRadius: 30, justifyContent: 'center', alignItems: 'center'}}/>
            <View style={{flex: 1}}>
              <Text style={{ fontSize: FontSize.heading }}>Create call link</Text>
              <Text style={{fontSize: FontSize.regular}} type={'regular'} numberOfLines={1}>Share a link for your WhatsApp call</Text>
            </View>
          </View>
        </TouchableHighlight>
        <Text style={{ padding: 15, fontSize: FontSize.heading }}>Recent</Text>
        <FlatList
        data={openSearch ? filteredHistory : history}
        scrollEnabled={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CallList call={item} multiple={multiple} setMultiple={setMultiple} selected={selected} setSelected={setSelected} />
        )}
      />
        
      </ScrollView>
      <FAB Icon={MaterialIcons} name={'add-call'} onPress={()=> router.navigate('/selectContact')} />
      </View>

  );
}


const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 10
  }
});


function SelectionHeader({ selected, setSelected, setMultiple }) {
  const theme = useColorScheme() ?? 'light'
  const { connected } = useAuth()
  const {setEnableEdit} = useSearchProvider()

  async function deleteCall() {
    if (!connected) {
      Alert.alert('Offline', 'connect to the internet to complete this action')
      return
    }
    for (const data of selected) {
     await firestore().collection('callHistory').doc(data.id).delete();
    }
    setSelected([])
    setMultiple(false)
  }

  useEffect(() => {
    setEnableEdit(true)
    return () => {
      setEnableEdit(false)
      setMultiple(false)
    }
  }, [])


  const headerWidth = useSharedValue(0)
  const opacity = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    width: headerWidth.value,
    opacity: opacity.value
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    headerWidth.value = withTiming(width, { duration: 500, easing: Easing.out(Easing.ease) })
  }, []);

  const handleClose = () => {
     opacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
     headerWidth.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
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
      <AntDesign name="delete" size={24} color={Colors[theme].text} onPress={deleteCall} />
    </Animated.View>
  )
}
