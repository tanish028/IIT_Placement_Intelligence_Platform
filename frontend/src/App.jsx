import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Compare from './pages/Compare'
import Branches from './pages/Branches'
import Sectors from './pages/Sectors'
import Trends from './pages/Trends'
import Predict from './pages/Predict'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ backgroundColor: '#111827' }}>
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/compare"  element={<Compare />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/sectors"  element={<Sectors />} />
            <Route path="/trends"   element={<Trends />} />
            <Route path="/predict"  element={<Predict />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
