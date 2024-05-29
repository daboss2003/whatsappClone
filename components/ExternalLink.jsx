import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform, Text} from 'react-native';

export default function ExternalLink(props) {
  return (
    <Text style={props.style}>
      <Link
      target="_blank"
      {...props}
      href={props.href}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          WebBrowser.openBrowserAsync(props.href);
        }
      }}
    />
    </Text>
  );
}
