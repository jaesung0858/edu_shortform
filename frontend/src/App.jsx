import { Navigate, Route, Routes } from 'react-router-dom'
import { LearningRoute, SummaryPage } from './features/learning'
import { LoginFeature } from './features/login'
import Layout from './layouts/layout'
import Home from './pages/home'
import Explore from './pages/explore'
import MyChannel from './pages/myChannel'
import MyPage from './pages/myPage'
import {useState, useEffect} from 'react'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin]= useState(false);
  const [loading, setLoading]=useState(true);

  useEffect(() => {
    fetch("/api/users/me", {
      credentials: "include"
    })
      .then((res) => {
        if(!res.ok || res.redirected) {
          throw new Error("로그인되지 않음");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setIsLogin(true);
      })
      .catch(() => {
        setUser(null);
        setIsLogin(false);
      })
      .finally(() => setLoading(false));

  },[]);

  return (
    <Routes>
      <Route element={<Layout user={user} />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/myChannel" element={<MyChannel user={user}/>} />
        <Route path="/myPage" element={<MyPage user={user}/>} />
      </Route>
      <Route path="/learn/summary" element={<SummaryPage />} />
      <Route path="/learn/:videoId" element={<LearningRoute />} />
      <Route path="/login" element={<LoginFeature />} />
      <Route path="/signup" element={<LoginFeature view="signup" />} />
      <Route path="/forgot-password" element={<LoginFeature view="forgot" />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
