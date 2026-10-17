import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LearningRoute, SummaryPage } from './features/learning'

// 라우터는 다른 팀원 담당. 학습 파트 라우트만 최소한으로 연결해 둔다.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/learn/1" replace />} />
        <Route path="/learn/summary" element={<SummaryPage />} />
        <Route path="/learn/:videoId" element={<LearningRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
