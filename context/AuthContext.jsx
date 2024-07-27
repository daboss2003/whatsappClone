import React, { useEffect, useState } from "react";
import { AuthContext } from "./context";
import { useRouter } from "expo-router";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";







export default function AuthProvider({ children, connected }) {
    console.log(connected + 'connected')
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setIsloading] = useState(true);
    const [userInfo, setuserInfo] = useState(null);
    const router = useRouter()

  

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(initializeUser);
        return () => {
            unsubscribe();
        }
    }, []);

    async function initializeUser(user) {
        if (user) {
            setCurrentUser({ ...user._user });
            setIsLoggedIn(true);
             setIsloading(false)
        }
        else {
            setCurrentUser(null);
             setIsloading(false)
            setIsLoggedIn(false);
            
        }
    }

    useEffect(() => {
        if(connected) return
        AsyncStorage.getItem('userInfo').then(data => data !== null && setuserInfo(JSON.parse(data))).catch(err => console.log(err))
    }, [connected]);

    useEffect(() => {
        if (loading) return
        if (isLoggedIn) return
        if (!isLoggedIn) {
          router.replace('/(auth)')
        }
    }, [isLoggedIn, loading]);


    useEffect(() => {
        if (!isLoggedIn || !connected) return
        setIsloading(true)
        const usersCollection = firestore().collection('Users').doc(currentUser.uid);
        const subscribe = usersCollection.onSnapshot((snapshot) => {
            if (snapshot.exists) {
                setIsloading(false)
                setuserInfo(snapshot.data())
                const jsonItem = JSON.stringify(snapshot.data())
                AsyncStorage.setItem('userInfo', jsonItem)
            }
            else {
                setIsloading(false)
                router.replace('/(setup)')
            }
        }, (error) => {
            Alert.alert('Authentication Error', error.message)
        })

        return subscribe
    }, [isLoggedIn, connected]);



    const value = { currentUser, isLoggedIn, loading, userInfo, connected };
    
    
    return (
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    )
}