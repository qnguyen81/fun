const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();



const express = require('express');
const app = express();

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

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

const isEmpty = (string) => {
  if (string.trim() === '') {
    return true;
  } else return false;
};

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

//sign up route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = 'must not be empty';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'must be a valid email address';
  }

  if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = 'Passwords must match';
  if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };

  //validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already is use' });
      } else {
        return res
          .status(500)
          .json({ general: 'Something went wrong, please try again' });
      }
    });

  // firebase
  //   .auth()
  //   .createUserWithEmailAndPassword(newUser.email, newUser.password)
  //   .then((data) => {
  //     return res
  //       .status(201)
  //       .json({ message: `user ${data.user.uid} signed up successfully` });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     return res.status(500).json({ error: err.code });
  //   });
});

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};

  if (isEmpty(user.email)) errors.email = 'must not be empty';
  if (isEmpty(user.password)) errors.spassword = 'must not be empty';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
