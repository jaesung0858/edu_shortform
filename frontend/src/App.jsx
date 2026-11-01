import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthSession } from './auth/useAuthSession'
import RequireAuth from './components/RequireAuth'
import { LearningRoute, SummaryPage } from './features/learning'
import { VideoUploadPage } from './features/videoUpload'
import { LoginFeature } from './features/login'
import Layout from './layouts/layout'
import Home from './pages/home'
import Explore from './pages/explore'
import MyChannel from './pages/myChannel'
import MyPage from './pages/myPage'
import VideoWatch from './pages/videoWatch'
import './App.css'

export default function App() {
  const { session } = useAuthSession()
  const { user } = session

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/explore" element={<Explore />} />
        <Route
          path="/myChannel"
          element={(
            <RequireAuth>
              <MyChannel user={user} />
            </RequireAuth>
          )}
        />
        <Route path="/myPage" element={<MyPage user={user} />} />
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/videos/:videoId" element={<VideoWatch />} />
        <Route path="/channel/upload" element={<VideoUploadPage />} />
      </Route>
      <Route path="/learn/summary" element={<SummaryPage />} />
      <Route
        path="/learn/:videoId"
        element={(
          <RequireAuth>
            <LearningRoute />
          </RequireAuth>
        )}
      />
      <Route path="/login" element={<LoginFeature />} />
      <Route path="/signup" element={<LoginFeature view="signup" />} />
      <Route path="/forgot-password" element={<LoginFeature view="forgot" />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
