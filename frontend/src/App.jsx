import { Navigate, Route, Routes } from 'react-router-dom'
import { LearningRoute, SummaryPage } from './features/learning'
import { LoginFeature } from './features/login'
import RequireAuth from './components/RequireAuth'
import Layout from './layouts/layout'
import Home from './pages/home'
import Explore from './pages/explore'
import MyChannel from './pages/myChannel'
import MyPage from './pages/myPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route
          path="/myChannel"
          element={
            <RequireAuth>
              <MyChannel />
            </RequireAuth>
          }
        />
        <Route path="/myPage" element={<MyPage />} />
      </Route>
      <Route path="/learn/summary" element={<SummaryPage />} />
      <Route
        path="/learn/:videoId"
        element={
          <RequireAuth>
            <LearningRoute />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<LoginFeature />} />
      <Route path="/signup" element={<LoginFeature view="signup" />} />
      <Route path="/forgot-password" element={<LoginFeature view="forgot" />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
