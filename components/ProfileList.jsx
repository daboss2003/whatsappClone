import { View,TouchableHighlight, useColorScheme, StyleSheet, Text as DefaultText } from 'react-native'
import React from 'react'
import { Text } from '../components/Themed'
import { MaterialIcons } from '@expo/vector-icons';
import Colors, { FontSize, brandColors } from '../constants/Colors';
import {useLimitWords} from '../hooks/useLimitWords'

export default function ProfileList({ Icon, title, content, info, onPress, edit }) {
    const theme = useColorScheme() ?? 'light'
    const {limitText, setContainer} = useLimitWords(content)
  return (
    <TouchableHighlight onPress={onPress} style={{alignItems: 'center', width: '100%'}} underlayColor={brandColors.underlay[theme]}>
        <View style={{width: '100%', alignItems: 'center', marginBottom: 15}}>
            <View style={styles.container}>
            {Icon} 
            <View style={styles.child} onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setContainer(width)
            }}>
                <Text type={'regular'} style={{fontSize: FontSize.regular}}>{title}</Text>
                <Text style={{fontSize: FontSize.heading}}>{limitText}</Text>
            </View>
            {edit && <MaterialIcons name="edit" size={24} color={brandColors.homeGreen[theme]} />} 
            </View>
            {info && <DefaultText style={{fontSize: FontSize.regular, maxWidth: '75%', marginTop: -7, color: Colors[theme].regularText}}>{info }</DefaultText>}
        </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        padding: 10
    },
    child: {
        flex: 1,
    }
})