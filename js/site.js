// const config = {
//     apiKey: "AIzaSyAKongB8c-8OWgZPe8Fyb-TreWtMMuDrTo",
//     authDomain: "cross-accounting.firebaseapp.com",
//     databaseURL: "https://cross-accounting.firebaseio.com",
//     projectId: "cross-accounting",
//     storageBucket: "cross-accounting.appspot.com",
//     messagingSenderId: "665881439885"
// };

let email = "testlogin881@gmail.com";
let password = "xxxxxx";
let name = "Jane";
let lastname = "xyz";
let displayName = name + " " + lastname;
let phoneNumber = "0825651452";
let uid = sessionStorage.uid;

$(function() {
    InitializeApp();
});

function InitializeApp() {
    $.getJSON("config.json", function(config) {
        firebase.initializeApp(config);
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                mainPage();
            } else {
                signInPage();
            }
        });
    });
}

function InitializeCategories(uid) {
    $.getJSON("initialize/categories.json", function(data) {
        firebase.database().ref("categories/" + uid + "/").set (data);
    });
}

function mainPage() {
    let uid = sessionStorage.uid;
    let displayName = sessionStorage.displayName;
    $('#container').load('includes/main.html');
    $('#header').html('<span id="display-name">' + displayName + '</span> (<a href="#" onclick="signOut()">ออกจากระบบ</a>)');
    firebase.database().ref("accountings/" + uid + "/").once('value').then(function(data) {
        if(data.val()) {
            console.log(555555);
        } else {
            console.log(666666);
        }
    });
}

function signInPage() {
    $('#header').html('');
    $('#container').load('includes/signin.html');
}

function registerPage() {
    $('#container').load('includes/register.html');
}

function resetPasseordPage() {
    $('#container').load('includes/resetpass.html');
}

function expensesPage() {
    $('#container').load('includes/expenses.html');
}

function incomePage() {
    $('#container').load('includes/income.html');
}

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

function storage(user) {
    sessionStorage.displayName = user.displayName;
    sessionStorage.email = user.email;
    sessionStorage.photoURL = user.photoURL;
    sessionStorage.uid = user.uid;
}

function signIn() {
    let email = $('input[name=email]').val();
    let password = $('input[name=password]').val();
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
        storage(user);
        mainPage();
    }).catch(function(error) {
        console.log(error.message);
    });
}

function signOut() {
    firebase.auth().signOut().then(function() {
        sessionStorage.clear();
        signInPage();
    }).catch(function(error) {
        console.log(error.message);
    });
}

function register() {
    let name = $('input[name=name]').val();
    let lastname = $('input[name=lastname]').val();
    let email = $('input[name=email]').val();
    let password = $('input[name=password]').val();
    let confirmPassword = $('input[name=confirmPassword]').val();
    let verifRegister = verificationRegister(name, lastname, email, password, confirmPassword);
    let displayName = name + " " + lastname;
    if(verifRegister) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
            let json = {
                email: email,
                name: name,
                lastname: lastname
            };
            firebase.database().ref("users/" + user.uid + "/").set (json);
            storage(user);
            updateDisplayName(displayName);
            InitializeCategories(user.uid);
        }).catch(function(error) {
            console.log(error.message);
        });
    }
}

function updateDisplayName(displayName) {
    firebase.auth().currentUser.updateProfile({displayName: displayName});
    sessionStorage.displayName = displayName;
}

function verificationRegister(name, lastname, email, password, confirmPassword) {
    if(password != confirmPassword)
    {
        return false;
    }
    return true;
}

function updateUser() {
    let user = firebase.auth().currentUser;
    user.updateProfile({
        displayName: displayName,
        photoURL: "https://firebase.google.com/_static/7e8fbbc4f5/images/firebase/lockup.png"
    }).then(function() {
        let json = {
            email: email,
            name: name,
            lastname: lastname,
            phoneNumber: phoneNumber
        };
        firebase.database().ref("users/" + user.uid + "/").update (json);
    }).catch(function(error) {
        console.log(error.message);
    });
}

function verificationEmail() {
    let user = firebase.auth().currentUser;
    user.sendEmailVerification().then(function() {
        // Email sent.
    }).catch(function(error) {
        console.log(error.message);
    });
}

function resetPassword() {
    let email = $('input[name=email]').val();
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Email sent.
    }).catch(function(error) {
        console.log(error.message);
    });
}