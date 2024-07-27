import { AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Dimensions, Keyboard, TextInput, View, useColorScheme } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import Colors, { brandColors } from "../constants/Colors";

const { width } = Dimensions.get('window')


export default function SearchBar({ openSearch, setOpenSearch, searchQuery, setSearchQuery }) {
    const theme = useColorScheme() ?? 'light'
    const inputRef = useRef(null)


  const headerWidth = useSharedValue(0)
   const opacity = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    width: headerWidth.value,
    opacity: opacity.value
  }));

  useEffect(() => {
    headerWidth.value = withTiming(width, { duration: 500, easing: Easing.out(Easing.ease) })
     opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
      if(inputRef.current) inputRef.current.focus()
  }, []);

  const handleClose = () => {
    Keyboard.dismiss()
    opacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    headerWidth.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, () => {
      'worklet'
      runOnJS(setOpenSearch)(false)
    });
    
    }
    
    if (!openSearch) {
        return <View style={{width: 0, height: 0}} />
    }

  return (
    <Animated.View style={[{height: 80, top:  20, left: 0, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', zIndex: 1000, backgroundColor: Colors[theme].background, marginBottom:  15}, animatedStyle]}>
      <StatusBar backgroundColor={Colors[theme].background} style={theme === 'light' ? 'dark' : 'light'} />
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 15, borderRadius: 30, backgroundColor: theme === 'light' ? '#e0e0e0' : '#1f2c36'  }}>
              <AntDesign name="arrowleft" size={24} color={Colors[theme].text} onPress={handleClose} />
              <TextInput
                onChangeText={value => setSearchQuery(value)}
                cursorColor={brandColors.homeGreen[theme]}
                value={searchQuery}
                style={{ color: Colors[theme].text, flex: 1 }}
                 placeholder={'Search by name or phone number'}
                   placeholderTextColor={Colors[theme].text}
                  keyboardType='default'
                  ref={inputRef}
                />
             {searchQuery && <AntDesign name="close" size={24} color={Colors[theme].text} onPress={ () => setSearchQuery('')} />}
      </View>
    </Animated.View>
  )
}
