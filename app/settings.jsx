import { ScrollView, TouchableHighlight, StyleSheet, useColorScheme, FlatList, View, Dimensions } from 'react-native'
import React from 'react'
import { Text } from '../components/Themed'
import { useAuth } from '../hooks/useAuth'
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import Colors, { brandColors } from '../constants/Colors';
import { placeHolder, settingsData } from '../constants/StaticData';
import ListItem from '../components/ListItem';
import { useRouter } from 'expo-router';
import {useLimitWords} from '../hooks/useLimitWords'
import { blurhash } from '../constants/StaticData';


const {width} = Dimensions.get('window')

export default function settings() {
  const { userInfo } = useAuth()
  const router = useRouter()
  let { imageUrl, username, about } = userInfo;
  if (!imageUrl) {
    imageUrl = placeHolder;
  }

  if (!about) {
    about = 'Hey there! I am using WhatsApp'
  }

  const theme = useColorScheme() ?? 'light'
  const {limitText, setContainer} = useLimitWords(about)
  return (
    <ScrollView style={{paddingHorizontal: 10, backgroundColor: Colors[theme].background}} scrollToOverflowEnabled>
      <TouchableHighlight onPress={ () => router.push('/(profile)')} underlayColor={brandColors.underlay[theme]}style={{width}}>
        <View style={{...styles.container, backgroundColor: Colors[theme].background}}>
          <View style={{flex: 1}}>
            <Image
              style={styles.image}
              source={imageUrl}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
          </View>
          <View style={{ flex: 3, justifyContent: 'center',alignItems: 'flex-start' }} onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainer(width)
          }}>
            <Text style={{fontSize: 16.5, lineHeight: 27}}>{username}</Text>
            <Text style={{fontSize: 14}} type={'regular'}>{ limitText }</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <Ionicons name="qr-code-outline" size={24} color={brandColors.homeGreen[theme]} />
            <Entypo name="chevron-with-circle-down" size={24} color={brandColors.homeGreen[theme]} />
          </View>
        </View>
      </TouchableHighlight>
      <FlatList
        data={settingsData}
        keyExtractor={item => item.header}
        renderItem={item => <ListItem item={item.item}  />
        }
        scrollEnabled={false}
      />
      <View style={{flex: 1}}></View>
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignitems: 'center',
    marginBottom: 10
  },
  image: {
    flex: 1,
    width: 60,
    backgroundColor: '#0553',
    borderRadius: 30,
    height: 60
  },


})