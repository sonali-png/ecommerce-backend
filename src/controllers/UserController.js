import UserService from "../services/UserService.js";
import { generateHashedPasswords } from "../utils/generatehashedpwd.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { users, total } = await UserService.getUsers(page, limit);

    res.status(201).render("users/list", {
      success: true,
      title: "Users list",
      total,
      page,
      pages: Math.ceil(total /limit),
      usersList:users
    });
    
  } catch (error) {
    res.status(500).render("users/list", {
      success: false,
      error: error.message,
      title: "Users list",
    });
  }
};


export const createUser = async (req, res) => {
  try {
    const hashedPassword = await generateHashedPasswords(req.body.password);

    const newCustomer = await UserService.createUser({
      ...req.body,
      status : req.body.status === "on" ? true : false, 
      password: hashedPassword,
    });

    res.status(201).render("users/add", {
      success: true,
      title: "Add User",
      user: newCustomer,
      message: "User added successfully",
    });
  } catch (error) {
    res.status(400).render("users/add", {
      success: false,
      title: "Add User",
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const users = await UserService.getAllUsers();
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }
  const accessToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
  res.json({ accessToken });
};

// router.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   const hashed = await bcrypt.hash(password, 10);
//   users.push({ username, password: hashed });
//   res.status(201).send('User registered');
// });
// router.post('/refresh', (req, res) => {
//   const token = req.cookies.refreshToken;
//   if (!token) return res.sendStatus(403);
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     const accessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     res.json({ accessToken });
//   });
// });


//App.js
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { useState } from 'react';
// import LoginPage from './LoginPage';
// import Dashboard from './Dashboard';

// function App() {
//   const [token, setToken] = useState(null);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage setToken={setToken} />} />
//         <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


//Login page
// import { useState } from 'react';
// import axios from 'axios';

// export default function LoginPage({ setToken }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   async function handleLogin() {
//     const res = await axios.post('/login', { username, password });
//     setToken(res.data.accessToken);
//   }

//   return (
//     <div>
//       <input value={username} onChange={e => setUsername(e.target.value)} />
//       <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
//       <button onClick={handleLogin}>Login</button>
//     </div>
//   );
// }