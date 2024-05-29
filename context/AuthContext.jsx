import React, { useEffect, useState } from "react";
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./context";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { useRouter } from "expo-router";





export default function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setIsloading] = useState(true);
    const [userInfo, setuserInfo] = useState(null);
    const router = useRouter()

  

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
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
        const userCollection = collection(db, 'users');
        const docRef = doc(userCollection, currentUser.uid)
        const subscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                setIsloading(false)
                setuserInfo(snapshot.data())
            }
            else {
                setIsloading(false)
                router.navigate('/(setup)')
            }
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