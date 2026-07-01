import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { UserFilesPage } from './pages/UserFilesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/creer-un-compte" element={<RegisterPage />} />
      <Route path="/mes-fichiers" element={<UserFilesPage />} />
    </Routes>
  )
}

export default App
