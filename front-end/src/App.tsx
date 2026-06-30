import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/creer-un-compte" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
