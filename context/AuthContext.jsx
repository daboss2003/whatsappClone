import React, { useEffect, useState } from "react";
import { AuthContext } from "./context";
import { useRouter } from "expo-router";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";







export default function AuthProvider({ children }) {
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
            setCurrentUser({ ...user });
            setIsLoggedIn(true);
        }
        else {
            setCurrentUser(null);
            setIsLoggedIn(false);
        }
        setIsloading(false)
    }


    useEffect(() => {
        if (!isLoggedIn) return
        setIsloading(true)
        const usersCollection = firestore().collection('Users').doc(currentUser.uid);
        const subscribe = usersCollection.onSnapshot((snapshot) => {
            if (snapshot.exists) {
                setIsloading(false)
                setuserInfo(snapshot.data())
            }
            else {
                setIsloading(false)
                router.replace('/(setup)')
            }
        }, (error) => {
            Alert.alert('Authentication Error', error.message)
        })

        return subscribe
    }, [isLoggedIn]);


    const value = { currentUser, isLoggedIn, loading, userInfo };
    
    
    return (
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    )
}