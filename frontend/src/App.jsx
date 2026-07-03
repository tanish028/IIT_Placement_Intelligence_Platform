import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Compare from './pages/Compare'
import Branches from './pages/Branches'
import Sectors from './pages/Sectors'
import Trends from './pages/Trends'
import Predict from './pages/Predict'

// Wrap each route in a keyed div so the fade-up animation re-triggers on navigation
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/"         element={<Home />} />
      <Route path="/compare"  element={<div className="page-enter"><Compare /></div>} />
      <Route path="/branches" element={<div className="page-enter"><Branches /></div>} />
      <Route path="/sectors"  element={<div className="page-enter"><Sectors /></div>} />
      <Route path="/trends"   element={<div className="page-enter"><Trends /></div>} />
      <Route path="/predict"  element={<div className="page-enter"><Predict /></div>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
