const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const config = {
  apiKey: 'AIzaSyDur55in20V--Y_IqKyJv4GzFlpUiDLb1Q',
  authDomain: 'my-pet-cafe-bf7e2.firebaseapp.com',
  databaseURL: 'https://my-pet-cafe-bf7e2.firebaseio.com',
  projectId: 'my-pet-cafe-bf7e2',
  storageBucket: 'my-pet-cafe-bf7e2.appspot.com',
  messagingSenderId: '572754491040',
  appId: '1:572754491040:web:c72e2f19cc3ea0dee0bbc5',
  measurementId: 'G-P2LZF4G529',
};

const express = require('express');
const app = express();

const firebase = require('firebase');
firebase.initializeApp();

app.get('/pet', (req, res) => {
  admin
    .firestore()
    .collection('pet')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let pets = [];
      data.forEach((doc) => {
        pets.push({
          petId: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(pets);
    })
    .catch((err) => console.error(err));
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// exports.getPets = functions.https.onRequest((req, res) => {
//     admin.firestore().collection('pet').get()
//         .then((data) => {
//             let pets =[];
//             data.forEach(doc => {
//                 pets.push(doc.data());
//         })
//         return res.json(pets);
//     }).catch(err => console.error(err))
// })

// exports.createPets = functions.https.onRequest((req, res) => {
app.post('/pet', (req, res) => {
  // if (req.method !== 'POST') {
  //   return res.status(400).json({ err: 'Method not allowed' });
  // }
  const newPet = {
    body: req.body.body,
    name: req.body.name,
    // createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection('pet')
    .add(newPet)
    .then((doc) => {
      res
        .json({ message: `document ${doc.id} created successfully.` })
        .catch((err) => {
          res.status(500).json({ err: 'something went wrong' });
          console.error(err);
        });
    });
});

//sign up route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed up successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
