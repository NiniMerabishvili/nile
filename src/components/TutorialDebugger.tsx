import { useState, useEffect } from 'react'
import { supabase, debugTutorials, getPendingTutorials, getAllTutorialsByCoach } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function TutorialDebugger() {
  const { user, profile } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runAllTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Check if tutorials table exists
      console.log('🔍 Testing if tutorials table exists...')
      const { data: tableTest, error: tableError } = await supabase
        .from('tutorials')
        .select('count(*)', { count: 'exact', head: true })
      
      results.tableExists = !tableError
      results.tableError = tableError?.message
      results.totalCount = tableTest

      // Test 2: Try to fetch all tutorials (no filters)
      console.log('🔍 Testing basic tutorial fetch...')
      const { data: allTutorials, error: allError } = await supabase
        .from('tutorials')
        .select('*')
      
      results.allTutorials = allTutorials
      results.allTutorialsError = allError?.message
      results.allTutorialsCount = allTutorials?.length || 0

      // Test 3: Test with foreign key join
      console.log('🔍 Testing tutorial fetch with coach join...')
      const { data: withCoach, error: coachError } = await supabase
        .from('tutorials')
        .select(`
          *,
          coach:profiles!tutorials_coach_id_fkey(*)
        `)
      
      results.withCoachJoin = withCoach
      results.coachJoinError = coachError?.message

      // Test 4: Test RLS policies
      console.log('🔍 Testing RLS policies...')
      const { data: currentUser } = await supabase.auth.getUser()
      results.currentUser = currentUser.user?.id
      results.userProfile = profile

      // Test 5: Test specific status queries
      console.log('🔍 Testing status-based queries...')
      const { data: pending, error: pendingError } = await supabase
        .from('tutorials')
        .select('*')
        .eq('status', 'pending')
      
      results.pendingTutorials = pending
      results.pendingError = pendingError?.message

      // Test 6: Test coach-specific queries
      if (user?.id) {
        console.log('🔍 Testing coach-specific queries...')
        const { data: coachTutorials, error: coachError } = await supabase
          .from('tutorials')
          .select('*')
          .eq('coach_id', user.id)
        
        results.coachTutorials = coachTutorials
        results.coachTutorialsError = coachError?.message
      }

      // Test 7: Test the actual functions being used
      console.log('🔍 Testing actual supabase functions...')
      try {
        results.debugTutorialsResult = await debugTutorials()
      } catch (e: any) {
        results.debugTutorialsError = e.message
      }

      try {
        results.getPendingResult = await getPendingTutorials()
      } catch (e: any) {
        results.getPendingError = e.message
      }

      if (user?.id && profile?.role === 'coach') {
        try {
          results.getAllByCoachResult = await getAllTutorialsByCoach(user.id)
        } catch (e: any) {
          results.getAllByCoachError = e.message
        }
      }

      // Test 8: Check database schema
      console.log('🔍 Testing database schema...')
      const { data: schemaTest, error: schemaError } = await supabase
        .rpc('get_schema_version')
        .single()
      
      results.schemaTest = schemaTest
      results.schemaError = schemaError?.message

    } catch (error: any) {
      results.globalError = error.message
    }

    setDebugInfo(results)
    setLoading(false)
    console.log('🎯 All debug results:', results)
  }

  useEffect(() => {
    runAllTests()
  }, [user, profile])

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
          🔧 Tutorial Debug Information
        </h3>
        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run All Tests'}
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Table Tests */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded border">
            <h4 className="font-semibold mb-2">📊 Table Existence</h4>
            <div className="space-y-1">
              <div>Tutorials table exists: <span className={debugInfo.tableExists ? 'text-green-600' : 'text-red-600'}>{debugInfo.tableExists ? '✅' : '❌'}</span></div>
              <div>Total tutorials count: <span className="font-mono">{debugInfo.totalCount || 0}</span></div>
              <div>All tutorials fetched: <span className="font-mono">{debugInfo.allTutorialsCount || 0}</span></div>
              {debugInfo.tableError && <div className="text-red-600 text-xs">Error: {debugInfo.tableError}</div>}
            </div>
          </div>

          {/* User Context */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded border">
            <h4 className="font-semibold mb-2">👤 User Context</h4>
            <div className="space-y-1">
              <div>User ID: <span className="font-mono text-xs">{debugInfo.currentUser || 'None'}</span></div>
              <div>Profile Role: <span className="font-mono">{debugInfo.userProfile?.role || 'None'}</span></div>
              <div>Is Coach: <span className={debugInfo.userProfile?.role === 'coach' ? 'text-green-600' : 'text-gray-600'}>{debugInfo.userProfile?.role === 'coach' ? '✅' : '❌'}</span></div>
            </div>
          </div>

          {/* Query Results */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded border">
            <h4 className="font-semibold mb-2">🔍 Query Results</h4>
            <div className="space-y-1">
              <div>Pending tutorials: <span className="font-mono">{debugInfo.pendingTutorials?.length || 0}</span></div>
              <div>Coach tutorials: <span className="font-mono">{debugInfo.coachTutorials?.length || 0}</span></div>
              <div>With coach join: <span className={debugInfo.coachJoinError ? 'text-red-600' : 'text-green-600'}>{debugInfo.coachJoinError ? '❌' : '✅'}</span></div>
            </div>
          </div>

          {/* Function Tests */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded border">
            <h4 className="font-semibold mb-2">⚙️ Function Tests</h4>
            <div className="space-y-1">
              <div>debugTutorials(): <span className="font-mono">{debugInfo.debugTutorialsResult?.length || 0}</span></div>
              <div>getPendingTutorials(): <span className="font-mono">{debugInfo.getPendingResult?.length || 0}</span></div>
              <div>getAllTutorialsByCoach(): <span className="font-mono">{debugInfo.getAllByCoachResult?.length || 0}</span></div>
            </div>
          </div>
        </div>

        {/* Detailed Error Information */}
        {(debugInfo.allTutorialsError || debugInfo.pendingError || debugInfo.coachJoinError) && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-700">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Errors Found</h4>
            <div className="space-y-2 text-xs">
              {debugInfo.allTutorialsError && <div>All tutorials error: {debugInfo.allTutorialsError}</div>}
              {debugInfo.pendingError && <div>Pending error: {debugInfo.pendingError}</div>}
              {debugInfo.coachJoinError && <div>Coach join error: {debugInfo.coachJoinError}</div>}
            </div>
          </div>
        )}

        {/* Sample Data */}
        {debugInfo.allTutorials && debugInfo.allTutorials.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📝 Sample Tutorial Data</h4>
            <pre className="text-xs overflow-auto max-h-32 bg-white dark:bg-gray-800 p-2 rounded">
              {JSON.stringify(debugInfo.allTutorials[0], null, 2)}
            </pre>
          </div>
        )}

        {/* Raw Debug Data */}
        <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
          <summary className="font-semibold cursor-pointer">🔍 Full Debug Data (Click to expand)</summary>
          <pre className="text-xs mt-2 overflow-auto max-h-64 bg-white dark:bg-gray-900 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
} 