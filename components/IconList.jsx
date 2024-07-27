import { View,TouchableHighlight, useColorScheme } from "react-native";
import { Text } from "./Themed";
import { FontSize, brandColors } from "../constants/Colors";


export default function IconList({ title, Icon, children, onPress, iconName }) {
    const theme = useColorScheme() ?? 'light'
  return (
    <TouchableHighlight onPress={onPress} style={{width: '100%', marginBottom: 5, padding: 10, }} underlayColor={brandColors.underlay[theme]}>
      <View style={{flexDirection: 'row', gap: 10, alignItems: "center"}}>
        <Icon name={iconName} size={24} color="#fff" style={{backgroundColor: brandColors.homeGreen[theme], padding: 12, borderRadius: 24, justifyContent: 'center', alignItems: 'center'}} />
        <Text style={{fontSize: FontSize.heading, flex: 1}}>{title}</Text>
        {children}
      </View>
    </TouchableHighlight>
  )
}