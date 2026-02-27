import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/common/ErrorBoundary'
import Layout from './components/common/Layout'
import HomePage from './components/HomePage'
import VoiceQA from './components/VoiceQA/VoiceQA'
import HazardDetection from './components/HazardDetection/HazardDetection'
import JHAChecklist from './components/JHAChecklist/JHAChecklist'
import './App.css'

// Wrapper that resets ErrorBoundary on route change
function LocationAwareErrorBoundary({ children }) {
  const location = useLocation()
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>
}

export default function App() {
  return (
    <BrowserRouter>
      <LocationAwareErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="voice-qa" element={<VoiceQA />} />
            <Route path="hazard-detection" element={<HazardDetection />} />
            <Route path="jha-checklist" element={<JHAChecklist />} />
          </Route>
        </Routes>
      </LocationAwareErrorBoundary>
    </BrowserRouter>
  )
}
