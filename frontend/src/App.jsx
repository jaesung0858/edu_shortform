import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/layout'
import Home from './pages/home'
import Expolre from './pages/explore'
import MyChannel from './pages/myChannel'
import MyPage from './pages/myPage'
import './App.css'




function App() {

  return(
    <Routes>
      <Route element={<Layout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Expolre />} />
      <Route path="/myChannel" element={<MyChannel />} />
      <Route path="/myPage" element={<MyPage />} />
      </Route>
    </Routes>
  )
}

export default App
