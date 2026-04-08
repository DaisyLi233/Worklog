import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProjectPage from './pages/ProjectPage'
import HistoryPage from './pages/HistoryPage'
import { AppProvider } from './lib/AppContext'

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/project/1" replace />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}
