# World Star Voice Room 🎙️✨

**World Star** is a real-time, mobile-first social voice room application. It allows users to join live voice rooms, take mic seats, chat, send animated gifts, and manage their profiles. Built using React (via CDN) and Firebase.

## 🚀 Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (React 18 via CDN, Babel Standalone)
- **Styling:** Tailwind CSS (via CDN) + Custom CSS (`style.css`)
- **Backend / Database:** Firebase (Auth, Firestore, Storage)
- **Other Libraries:** Cropper.js (for image cropping)

## 📁 Project Structure
This is a static web application divided into 3 main files:
1. `index.html`: Contains the DOM structure and all the CDN links for React, Firebase, Babel, and Tailwind.
2. `style.css`: Contains all custom styles, animations (gift animations, mic live pulses), and layout configurations.
3. `script.js`: Contains the entire React application logic, components, and Firebase database connections.

## ✨ Key Features

### 🎤 Voice Room System
- **10 Mic Seats:** Users can join the room and take a seat to speak.
- **Real-Time Moderation:** Room owners and Admins can mute, kick, or block users.
- **Presence System:** See who is online and who is speaking (live pulse animation).
- **Room Passwords:** Ability to create locked rooms.
- **Minimize Room:** Users can minimize the room and browse the app while staying connected.

### 🎁 Gift System & Animations
- Real-time sending of animated gifts (Float, Bounce, Explode, Slide).
- Integrated sound effects for gifts.
- Charms and Coins deduction system.

### 💬 Chat System
- **Room Chat:** Real-time text chat inside the voice room.
- **Direct Messages:** Private 1-on-1 messaging between friends.
- **Friend Requests:** Send and accept friend requests using unique 9-digit User IDs.

### 👑 Admin Dashboard
- **Drag & Drop Admin Button:** A floating crown button for the Super Admin.
- **Gift Management:** Dynamically add, edit, or remove gifts (Emoji, Image, Video, Sound).
- **User Moderation:** Ban/Unban users, send coins directly, grant admin privileges.

## 🛠️ How to Run Locally
Since it's a static site, you don't need a Node.js server.
1. Clone the repository.
2. Open `index.html` in your browser.
3. To bypass Google Login and test the app instantly, add `?autostart=1` to the URL (e.g., `index.html?autostart=1`).

## ⚠️ Firebase Requirements (Crucial for Developers)
For this app to work correctly (e.g., creating rooms, sending gifts, chatting), the Firebase project must be configured correctly:
1. **Firestore Rules:** During development/testing, ensure your Firestore rules allow reads and writes:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
