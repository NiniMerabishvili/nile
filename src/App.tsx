import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Gyms from '@/pages/Gyms'
import Trainers from '@/pages/Trainers'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import GymProfile from '@/pages/GymProfile'
import TrainerProfile from '@/pages/TrainerProfile'
import SignIn from '@/pages/SignIn'
import SignUp from '@/pages/SignUp'
import AdminDashboard from '@/pages/AdminDashboard'
import AddGym from '@/pages/AddGym'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'

// Import test utility for debugging in development
import '@/utils/test-supabase'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gyms" element={<Gyms />} />
              <Route path="/gyms/:id" element={<GymProfile />} />
              <Route path="/trainers" element={<Trainers />} />
              <Route path="/trainers/:id" element={<TrainerProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/add-gym" element={<AddGym />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App