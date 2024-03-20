const firebaseConfig = {
    apiKey: "AIzaSyChM8TPAw9e2fLwWqhgGNJqbx1Kmrl47Ho",
    authDomain: "emogambling.firebaseapp.com",
    projectId: "emogambling",
    storageBucket: "emogambling.appspot.com",
    databaseURL: "emogambling.firebaseio.com",
    messagingSenderId: "484553012797",
    appId: "1:484553012797:web:74cc0771b643330beadc54"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Enable persistence
firebase.firestore().enablePersistence()
    .catch(function(err) {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
        } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
        }
    });



firebase.auth().signInAnonymously();
let uid, db = firebase.firestore();
firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
        uid = user.uid;
        console.log('user signed in as:' + uid);
    }
})

function ensure_uid_set(timeout) {
    let start = performance.now()
    return new Promise(wait_for_uid);

    function wait_for_uid(resolve, reject) {
        if (uid) {
            resolve(uid);
        } else if (timeout && (performance.now() - start) >= timeout) {
            reject(new Error("Timeout while getting firebase uid"));
        } else {
            setTimeout(wait_for_uid.bind(this, resolve, reject), 30);
        }

    }
}

