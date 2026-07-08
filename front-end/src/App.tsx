import { Navigate, Route, Routes } from 'react-router-dom'
import { DownloadPage } from './pages/DownloadPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SharePage } from './pages/SharePage'
import { UserFilesPage } from './pages/UserFilesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SharePage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/creer-un-compte" element={<RegisterPage />} />
      <Route path="/partage" element={<Navigate to="/" replace />} />
      <Route path="/mes-fichiers" element={<UserFilesPage />} />
      <Route path="/telechargement/:downloadToken" element={<DownloadPage />} />
    </Routes>
  )
}

export default App
