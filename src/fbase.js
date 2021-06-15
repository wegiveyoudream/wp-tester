import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import "firebase/database";

const range = (min, max) => {
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  return value;
};

// var firebaseConfig = {
//   apiKey: "AIzaSyBipiTv1lThCOYOoscLLMDRR6Cnz8RqmzA",
//   authDomain: "nwiter-cd17d.firebaseapp.com",
//   databaseURL: "https://nwiter-cd17d-default-rtdb.firebaseio.com",
//   projectId: "nwiter-cd17d",
//   storageBucket: "nwiter-cd17d.appspot.com",
//   messagingSenderId: "257800727565",
//   appId: "1:257800727565:web:9b231f4d84debda88eb944",
// };
const firebaseConfigDefault = {
  apiKey: "AIzaSyAzxCzTSK9f2j_pTvtBkg_VLnqpOWyNonU",
  authDomain: "checksystem-193c7.firebaseapp.com",
  databaseURL: "https://checksystem-193c7-default-rtdb.firebaseio.com",
  projectId: "checksystem-193c7",
  storageBucket: "checksystem-193c7.appspot.com",
  messagingSenderId: "300844364368",
  appId: "1:300844364368:web:58a8f1c3f3644a00b05755",
  measurementId: "G-90GHWMYCHQ",
};

const firebaseConfigs = [
  {
    apiKey: "AIzaSyAzxCzTSK9f2j_pTvtBkg_VLnqpOWyNonU",
    authDomain: "checksystem-193c7.firebaseapp.com",
    databaseURL: "https://checksystem-193c7-default-rtdb.firebaseio.com",
    projectId: "checksystem-193c7",
    storageBucket: "checksystem-193c7.appspot.com",
    messagingSenderId: "300844364368",
    appId: "1:300844364368:web:58a8f1c3f3644a00b05755",
    measurementId: "G-90GHWMYCHQ",
  },
  {
    apiKey: "AIzaSyBczcCqGDOlJ_Kv7goXpRiBuFlkqq_aU0M",
    authDomain: "wptester2018.firebaseapp.com",
    databaseURL:
      "https://wptester2018-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wptester2018",
    storageBucket: "wptester2018.appspot.com",
    messagingSenderId: "603819967345",
    appId: "1:603819967345:web:94551dd02a9a37ffceecd0",
  },
];

const firebaseInstance = firebase.initializeApp(firebaseConfigDefault);
const database = firebaseInstance.database();
const storage = firebaseInstance.storage();
const authService = firebaseInstance.auth();

const index = range(0, firebaseConfigs.length - 1);
console.log("index", index);
const firebaseConfigOther = firebaseConfigs[index];
const firebaseInstanceOther = firebase.initializeApp(
  firebaseConfigOther,
  firebaseConfigOther.apiKey
);
const databaseOther = firebaseInstanceOther.database();
const storageOther = firebaseInstanceOther.storage();

export {
  firebaseInstance,
  database,
  storage,
  authService,
  databaseOther,
  storageOther,
};
