import { Routes, Route } from 'react-router-dom'
import HomeScreen from './scenes/HomeScreen'
import BunqHome from './scenes/BunqHome'
import CameraScreen from './scenes/CameraScreen'
import ReviewScreen from './scenes/ReviewScreen'
import Feed from './scenes/Feed'
import WeeklyWrapped from './scenes/WeeklyWrapped'
import { useTransactionListener } from './hooks/useTransactionListener'
import './App.css'

function App() {
  useTransactionListener()

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/bunq" element={<BunqHome />} />
      <Route path="/camera/:txId" element={<CameraScreen />} />
      <Route path="/review" element={<ReviewScreen />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/wrapped" element={<WeeklyWrapped />} />
    </Routes>
  )
}

export default App
