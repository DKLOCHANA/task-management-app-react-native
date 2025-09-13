# 🚀 Task Management App

*A modern cross-platform task manager built with React Native, Expo, GraphQL, and Supabase*

## ✨ Features

### 📋 Core Functionality
- ✅ Create, read, update, delete tasks with priorities & due dates
- 🎨 Organize tasks with **color-coded categories**
- 🔄 Track status: **Todo / In Progress / Completed**
- 📊 Dashboard with task statistics & progress
- ⚡ Real-time sync via GraphQL subscriptions

### 📱 Mobile-First Experience
- 📲 Optimized for iOS & Android
- 👆 Touch-friendly & gesture-based UI
- ⏳ Smooth loading & error states
- 📶 Offline support with Apollo cache

---

## 🛠 Tech Stack

### Frontend
- **React Native** (Expo SDK 54)
- **TypeScript**
- **NativeWind** (Tailwind for React Native)
- **React Navigation**, Ionicons

### Backend
- **GraphQL** (Apollo Server)
- **Apollo Client** (state management & caching)
- **Supabase** (PostgreSQL + Realtime)

### Tooling
- Metro bundler, Babel
- ESLint + Prettier

---

## 🏗 Project Structure

```
test-app/
├── src/
│   ├── apollo/          # Apollo setup (client, queries, mutations, types)
│   ├── components/      # UI + feature components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Supabase client
│   ├── screens/         # App screens
│   └── types/           # Shared TypeScript types
├── server/
│   ├── graphql/         # GraphQL schema + resolvers
│   └── lib/             # Server-side Supabase client
├── database-setup.sql   # Database schema & migrations
├── API_DOCUMENTATION.md # Detailed API usage examples
└── App.tsx              # Root entry point
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18+
- **Expo CLI**: `npm install -g @expo/cli`
- **Supabase account**
- **iOS/Android emulator** or physical device

### Setup

1. **Clone & Install**
   ```bash
   git clone your-repo-url
   cd test-app
   npm install
   ```

2. **Environment Variables**
   
   Create a `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   PORT=4000
   ```

3. **Database Setup**
   
   Run the SQL file in Supabase:
   ```sql
   -- See database-setup.sql for full schema
   ```

4. **Start GraphQL Server**
   ```bash
   npm run server
   ```

5. **Start Expo App**
   ```bash
   npm start
   ```

6. **Documentation**
   
   See `API_DOCUMENTATION.md` for GraphQL queries & mutations

---

## 📱 Screenshots

![Image](https://github.com/user-attachments/assets/48798631-61af-4054-9fb2-b3da417fc0e1)
![Image](https://github.com/user-attachments/assets/93a8a0eb-b0b5-47dd-95c7-9ba53fb01ac4)
![Image](https://github.com/user-attachments/assets/3f39128b-343d-4657-be27-e4b23cf2ffd1)
![Image](https://github.com/user-attachments/assets/7f578687-4185-4bba-9140-0f2ccfe23193)
![Image](https://github.com/user-attachments/assets/8084478f-de18-4df8-872b-216199974781)
![Image](https://github.com/user-attachments/assets/6e27f912-0141-4705-b8d9-446877d18802)
![Image](https://github.com/user-attachments/assets/617b1d99-5dd8-4c6f-9ab3-1a94dd82233b)


---

## 📱 Demo Video

https://github.com/user-attachments/assets/ca6e8bfd-277a-4508-936e-1a777270ebd1

---

## 📱 Demo App

https://expo.dev/accounts/lochanad23/projects/test-app/builds/b3d5f5aa-0cae-4731-8f2c-c1252d782293

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support

If you have any questions or run into issues, please open an issue on GitHub.



