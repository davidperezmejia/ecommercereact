import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCwEl13mIzKSkaiCvmK9kZP3Z-zBI3zkyA",
  authDomain: "ecommercecoder-f1a7d.firebaseapp.com",
  projectId: "ecommercecoder-f1a7d",
  storageBucket: "ecommercecoder-f1a7d.appspot.com",
  messagingSenderId: "607024289114",
  appId: "1:607024289114:web:60014dc12352c63b05cf63",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const fs = firebase.firestore();
const storage = firebase.storage();

export {auth,fs,storage}