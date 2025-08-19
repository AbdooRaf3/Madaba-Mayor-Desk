importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js")

const firebase = self.firebase // Declare the firebase variable

firebase.initializeApp({
  apiKey: "AIzaSyCVRJkczy_1wXIaknEEbdvmV3FxlLq8UvE",
  authDomain: "mayor-schedule.firebaseapp.com",
  projectId: "mayor-schedule",
  storageBucket: "mayor-schedule.appspot.com",
  messagingSenderId: "264727738578",
  appId: "1:264727738578:web:6bbbbfb36a474beabfd50b",
  measurementId: "G-8WBGXXKNHF",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || "New Notification", {
    body: body || "",
  })
})
