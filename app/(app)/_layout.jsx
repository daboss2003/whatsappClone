import React, { useEffect, useState } from 'react';
import {Stack, useRouter, withLayoutContext } from 'expo-router';
import Colors, { FontSize, brandColors } from '../../constants/Colors';
import { useColorScheme, View, Appearance, Text, SafeAreaView } from 'react-native';
import HeaderButtons from '../../components/HeaderButtons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth'
import * as NavigationBar from 'expo-navigation-bar';
import firestore from '@react-native-firebase/firestore';
import { SearchContext } from '../../context/context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StoreKnownUsers } from '../../constants/StoreKnownUsers';

const { Navigator } = createMaterialTopTabNavigator()

export const Tabs = withLayoutContext(Navigator)





function TabBarIcon(props) {
  return (
    <View style={{
      backgroundColor: props.focused ? props.theme === 'light'?  'rgba(0, 0, 0, 0.1)' : 'rgba(18, 27, 34, 0.5)' : '',
      width: 70,
      borderRadius: 20,
      height: 35,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <props.Icon size={props.size} style={{ marginBottom: -4 }} {...props}  />
    </View>
  );
}







 export default function TabLayout() {
   const theme = useColorScheme() ?? 'light';
   const { currentUser, connected } = useAuth()
   const router = useRouter()
   const [unseen, setUnseen] = useState(0)
   const [openSearch, setOpenSearch] = useState(false)
   const [enableEdit, setEnableEdit] = useState(false)
   
   
   useEffect(() => {
     if (!connected) return
     const messageRef = firestore().collection('chats')
       messageRef.where('users', 'array-contains', currentUser.uid).onSnapshot(snapshot => {
         if (!snapshot.empty) {
            let count = 0
            snapshot.docs.forEach(item => {
              if (item.data().messages.some(data => data.seen === false && data.senderId !== currentUser.uid)) {
                count++
              }
              const sender = item.data().users.find(data => data !== currentUser.uid)
              StoreKnownUsers(sender).catch(err => console.log(err))
            });
            setUnseen(count)
          }
       }, (err) => {
         console.log(err)
        })
       
   }, [connected]);



  


   useEffect(() => {
     NavigationBar.setBackgroundColorAsync(theme === 'dark' ? brandColors.primary[theme] : Colors[theme].background);
     NavigationBar.setButtonStyleAsync(theme);
     const subscribe = Appearance.addChangeListener(({ colorScheme }) => {
       NavigationBar.setBackgroundColorAsync(colorScheme === 'dark' ? brandColors.primary[colorScheme] : Colors[colorScheme].background);
       NavigationBar.setButtonStyleAsync(colorScheme);
     });
     return () => subscribe.remove()
   }, []);



    useEffect(() => {
    const unsubscribe = firestore()
      .collection('calls')
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {
          snapshot.docChanges().forEach(change => {
          if (change.type === 'added'  && change.doc.id === currentUser.uid) {
            const callData = change.doc.data();''
            router.navigate({
              pathname: '/callAlertModal',
              params: {
                channelName: callData.channelName,
                isVideoCall: callData.isVideoCall,
                callerId: callData.callerId,
                recieverId: change.doc.id,
                callID: callData.callID
              }
            });
          }
          });
        }
       
      });

    return () => unsubscribe();
    }, []);
   
   
   

   

   
   return (
     <SearchContext.Provider value={{ openSearch, setOpenSearch, enableEdit, setEnableEdit }}>
       <SafeAreaView style={{flex: 1}}>
       <Stack.Screen options={{ 
        headerShown: openSearch || enableEdit ? false : true,
        headerTitle: 'WhatsApp',    
        headerRight: () => (
              <HeaderButtons setSearch={setOpenSearch} />
           ),             
        headerBackVisible: false,
        headerStyle: {
          backgroundColor: brandColors.primary[theme],
        },
        headerTitleStyle: {
          color: '#fff',
          letterSpacing: 1.5,
          fontFamily: 'HelveticaBold',
          fontSize: 23
           },
        animation: "fade"
         }} />
         <Tabs
           screenOptions={{
          tabBarPosition: 'bottom',
          tabBarActiveTintColor: Colors[theme ?? 'light'].tint,
          tabBarStyle: {
            backgroundColor: theme === 'dark' ? brandColors.primary[theme] : Colors[theme].background,
            height: 70
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontFamily: 'Helvetica',
            },
            tabBarShowIcon: true,
            tabBarIndicatorContainerStyle: {
            opacity: 0
             },
             tabBarItemStyle: {
               flex: 1,
               justifyContent: 'center', 
               alignItems: 'center',
               flexDirection: 'column'
             },
             tabBarIconStyle: {
                justifyContent: 'center', 
               alignItems: 'center',
             },
            
           }}
           tabBarPosition='bottom'
         >
         <Tabs.Screen
           name="index"
           options={{
             tabBarIcon: ({ color, focused }) => <TabBarIcon name="chatbox-ellipses" color={color} theme={theme} Icon={Ionicons} size={27} focused={focused} />,
             tabBarLabel: 'Chats',
             tabBarBadge: () => (
               <View style={{ backgroundColor: unseen > 0 ? brandColors.homeGreen[theme] : 'rgba(0,0,0,0)', justifyContent: 'center', alignItems: 'center', width: 20, height: 20, borderRadius: 10, position: 'absolute', left: -50 }}>
                 <Text style={{ color: '#fff', fontSize: FontSize.regular }}>{unseen > 0 ? unseen : ''}</Text>
               </View>
            ) 
          }}  
          />

          <Tabs.Screen
          name="calls"
          options={{
            tabBarIcon: ({ color, focused }) => <TabBarIcon name="phone" color={color} theme={theme} Icon={MaterialCommunityIcons} size={27} focused={focused} />,
            tabBarLabel: 'Calls',
          }}
          />

          <Tabs.Screen
          name="updates"
          options={{
            tabBarIcon: ({ color, focused }) => <TabBarIcon name="camera-iris" color={color} theme={theme} Icon={MaterialCommunityIcons} size={27} focused={focused} />,
            tabBarLabel: 'Updates'
          }}
          />

          <Tabs.Screen
          name="tools"
          options={{
            tabBarIcon: ({ color, focused }) => <TabBarIcon name="shop" color={color} theme={theme} Icon={FontAwesome6} size={20} focused={focused} />,
            tabBarLabel: 'Tools'
          }}
          />
         </Tabs>
      </SafeAreaView>
    </SearchContext.Provider>
  );
}





       
        
        
     
