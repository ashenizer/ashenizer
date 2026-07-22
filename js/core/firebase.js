
// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoavz3Vr2WX-jcazkUgMIsPBHxaz7eoe8",
  authDomain: "company-portal-4a570.firebaseapp.com",
  projectId: "company-portal-4a570",
  storageBucket: "company-portal-4a570.firebasestorage.app",
  messagingSenderId: "905999710737",
  appId: "1:905999710737:web:71b4f171edd27c443b4fb0"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);


// ✅ Force session to LOCAL (stable)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)


// ✅ Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ✅ Make globally accessible (like your App object)
window.FirebaseService = {
  auth,
  db,
  storage
};

// ✅ Debug check (optional but helpful)
console.log("✅ Firebase connected:", FirebaseService);