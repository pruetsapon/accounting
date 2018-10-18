const config = {
    apiKey: "AIzaSyAKongB8c-8OWgZPe8Fyb-TreWtMMuDrTo",
    authDomain: "cross-accounting.firebaseapp.com",
    databaseURL: "https://cross-accounting.firebaseio.com",
    projectId: "cross-accounting",
    storageBucket: "cross-accounting.appspot.com",
    messagingSenderId: "665881439885"
};
firebase.initializeApp(config);

let email = "testlogin881@gmail.com";
let password = "xxxxxx";
let name = "Jane";
let lastname = "Xazdio";
let displayName = name + " " + lastname;
let phoneNumber = "0825651452";
let uid = sessionStorage.uid;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        console.log(user);
        console.log("User is signed in.");
    } else {
        console.log("No user is signed in.");
    }
});

var userN = "Johnx";
//delete
// firebase.database().ref("users/" + userN + "/").remove();
//insert
// var playersRef = firebase.database().ref("types/expenses").set ({
//   code: 1,
//   name: 'รายจ่าย'
// });
//update
// var johnRef = firebase.database().ref("users/John").update ({
//   number: 101
// });
//select
// var playersRef = firebase.database().ref("users/").orderByChild("name").on("child_added", function(data) {
//   console.log(data.val());
// });
// var playersRef = firebase.database().ref(uid + "/").orderByChild("name").on("child_added", function(data) {
//   console.log(data.val());
// });

function SignIn()
{
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(data) {
        console.log('Sign in successful.');
    }).catch(function(error) {
        console.log(error.message);
    });
}

function SignOut()
{
    firebase.auth().signOut().then(function() {
        console.log("Sign-out successful.");
    }).catch(function(error) {
        console.log(error.message);
    });
}

function Register()
{
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(data) {
        firebase.database().ref("users/" + data.user.uid + "/").set ({
            email: email,
            age: 30
        });
        console.log('Create User successful.');
    }).catch(function(error) {
        console.log(error.message);
    });
}

function UpdateUser()
{
    var user = firebase.auth().currentUser;
    user.updateProfile({
        displayName: displayName,
        photoURL: "https://firebase.google.com/_static/7e8fbbc4f5/images/firebase/lockup.png"
    }).then(function() {
        firebase.database().ref("users/" + user.uid + "/").update ({
            name: name,
            lastname: lastname,
            phoneNumber: phoneNumber
        });
        console.log("Update successful.");
    }).catch(function(error) {
        console.log(error.message);
    });
}

function VerificationEmail()
{
    var user = firebase.auth().currentUser;
    user.sendEmailVerification().then(function() {
        console.log("Email sent.");
    }).catch(function(error) {
        console.log(error.message);
    });
}

function ResetPassword()
{
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        console.log("Email sent.");
    }).catch(function(error) {
        console.log(error.message);
    });
}