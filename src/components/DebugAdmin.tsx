import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function DebugAdmin() {
  const { user, profile, isAdmin } = useAuth()
  const [gyms, setGyms] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkEverything()
  }, [user])

  const checkEverything = async () => {
    try {
      console.log('Current user:', user)
      console.log('Current profile:', profile)
      console.log('Is admin:', isAdmin)

      // Try to fetch all gyms first
      const { data: allGyms, error: allError } = await supabase
        .from('gyms')
        .select('*')

      console.log('All gyms query result:', { data: allGyms, error: allError })

      if (allError) {
        setError(`Error fetching all gyms: ${allError.message}`)
        return
      }

      // Try to fetch pending gyms
      const { data: pendingGyms, error: pendingError } = await supabase
        .from('gyms')
        .select('*')
        .eq('status', 'pending')

      console.log('Pending gyms query result:', { data: pendingGyms, error: pendingError })

      if (pendingError) {
        setError(`Error fetching pending gyms: ${pendingError.message}`)
        return
      }

      setGyms(allGyms || [])
    } catch (err: any) {
      console.error('Debug error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading debug info...</div>

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm space-y-4">
      <h3 className="font-bold text-lg">Debug Information</h3>
      
      <div>
        <strong>User:</strong> {user ? user.email : 'Not logged in'}
      </div>
      
      <div>
        <strong>Profile Role:</strong> {profile?.role || 'No role'}
      </div>
      
      <div>
        <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
      </div>

      <div>
        <strong>Total Gyms in Database:</strong> {gyms.length}
      </div>

      <div>
        <strong>Gyms by Status:</strong>
        <ul className="ml-4 mt-2">
          <li>Pending: {gyms.filter(g => g.status === 'pending').length}</li>
          <li>Approved: {gyms.filter(g => g.status === 'approved').length}</li>
          <li>Rejected: {gyms.filter(g => g.status === 'rejected').length}</li>
          <li>No status: {gyms.filter(g => !g.status).length}</li>
        </ul>
      </div>

      {error && (
        <div className="text-red-600 bg-red-100 p-2 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div>
        <strong>Sample Gym Data:</strong>
        <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(gyms.slice(0, 2), null, 2)}
        </pre>
      </div>

      <button
        onClick={checkEverything}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh Debug Info
      </button>
    </div>
  )
} 