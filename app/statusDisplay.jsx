import { View, Text, Button } from 'react-native'
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusScreen from '../components/StatusScreen';

export default function statusDisplay() {
    const { index } = useLocalSearchParams()
    const [status, setStatus] = useState([])
    const router = useRouter()

    useEffect(() => {
        async function getStatus() {
            try {
                const jsonValue = await AsyncStorage.getItem('status');
                setStatus(JSON.parse(jsonValue));
            }
            catch (err) {
                console.log(err)
            }
        }
        getStatus()
    }, []);

    if (!status || status.length <= 0) {
        return (
            <View>
                <Text>No Status found</Text>
                <Button title='Go back' onPress={router.back} />
            </View>
        )
    }
  return (
    <View style={{flex : 1}}>
      <SwiperFlatList
      index={parseInt(index)}
      data={status}
      vertical        
      renderItem={({ item }) => <StatusScreen data={item} />}
    />
    </View>
  )
}