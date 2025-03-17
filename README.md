WADS - To Do List

Simple to do list application that allows the user to create their own account and perform basic CRUD operations in modifying their to-do list

## Installation

1. Clone the repository
   ```
   git clone https://github.com/Frahyang/WADS-todolist.git
   ```
2. Install required files
   ```
   npm i
   ```
3. Create an .env.local file to connect your firebase account and enter the following code inside the file
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here

## Setting up the firebase

1. Go to firebase website project page and create a new project
2. Add a new webapp, copy and paste the firebaseconfig attributes into the .env.local file
3. Go to authentication and select Email/Password for the native provider and Google for the additional provider
4. Next, go to Firestore Database page and setup the database with test mode for development

## Launch the App
   Go back to the terminal and run:
   ```
   npm start
   ```
