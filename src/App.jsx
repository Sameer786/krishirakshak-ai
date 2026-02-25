import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import HomePage from './components/HomePage'
import VoiceQA from './components/VoiceQA/VoiceQA'
import HazardDetection from './components/HazardDetection/HazardDetection'
import JHAChecklist from './components/JHAChecklist/JHAChecklist'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="voice-qa" element={<VoiceQA />} />
          <Route path="hazard-detection" element={<HazardDetection />} />
          <Route path="jha-checklist" element={<JHAChecklist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
