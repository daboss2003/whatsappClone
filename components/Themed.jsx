/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '../constants/Colors';
import { useColorScheme, Keyboard, TouchableWithoutFeedback } from 'react-native';


export function useThemeColor(
  props,
  colorName
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props) {
  const { style, lightColor, darkColor, type, ...otherProps } = props;
  const decision = type === 'regular' ? 'regularText' : 'text'
  const color = useThemeColor({ light: lightColor, dark: darkColor }, decision);

  return <DefaultText style={[{ color, fontFamily: decision === 'regularText' ? 'Helvetica' : 'HelveticaBold' }, style]} {...otherProps} />;
}

export function View(props) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[{ backgroundColor, flex: 1, alignItems: 'center', paddingHorizontal: 20, }, style]} {...otherProps} />
    </TouchableWithoutFeedback>
  );
}
