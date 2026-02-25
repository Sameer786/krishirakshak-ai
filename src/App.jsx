import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import Home from './components/Home'
import VoiceQA from './components/VoiceQA/VoiceQA'
import HazardDetection from './components/HazardDetection/HazardDetection'
import JHAChecklist from './components/JHAChecklist/JHAChecklist'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="voice" element={<VoiceQA />} />
          <Route path="hazard" element={<HazardDetection />} />
          <Route path="checklist" element={<JHAChecklist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
