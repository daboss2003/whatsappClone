import { StyleSheet, useColorScheme, TouchableOpacity, Image, View as DefaultView, Text as DefaultText } from 'react-native';
import { Text, View } from '../../components/Themed';
import Entypo from '@expo/vector-icons/Entypo';
import { brandColors } from '../../constants/Colors';
import ExternalLink from '../../components/ExternalLink';
import Feather from '@expo/vector-icons/Feather';
import MyButton from '../../components/MyButton';
import { router } from 'expo-router';


export default function Wellcome() {
  const theme = useColorScheme() ?? 'light';
  return (
    <View>
      <Image source={require('../../assets/images/welcome.png')} style={styles.image} />
      <Text style={styles.title}>Welcome to WhatsApp</Text>
      <Text type={'regular'} style={styles.text}>Read our
        <ExternalLink href={'https://www.whatsapp.com'} children={' Privacy Policy. '} style={{ color: brandColors.blueColor }} />
        Tap "Agree and continue" to accept the 
        <ExternalLink href={'https://www.whatsapp.com'} children={' Terms of Service.'} style={{ color: brandColors.blueColor }} />
      </Text>
      <TouchableOpacity style={{...styles.dropdown,  backgroundColor: theme === 'light' ? '#EaF0EF' : ''}}>
        <Feather name="globe" size={24} color={brandColors.green[theme]} />
        <DefaultText style={{ color: brandColors.green[theme], fontSize: 17, fontFamily: 'Helvetica' }}>English</DefaultText>
        <Entypo name="chevron-small-down" size={28} color={brandColors.green[theme]} />
      </TouchableOpacity>
      <DefaultView style={{flex: 1}}></DefaultView>
      <MyButton full={true} onPress={() => router.replace('/sendOTP')} >Agree and continue</MyButton>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    letterSpacing: 2,
    marginBottom : 8
  },
  dropdown: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    borderRadius: 25,
    marginVertical: 15,
    paddingVertical: 10,
    justifyContent: 'center'
  },
  image: {
    width: 400,
    height: 400
  },
  text: {
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 16,
  },
 
});
