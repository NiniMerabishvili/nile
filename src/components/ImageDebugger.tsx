import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ImageDebugger() {
  const [gyms, setGyms] = useState<any[]>([])

  useEffect(() => {
    fetchGymsData()
  }, [])

  const fetchGymsData = async () => {
    const { data, error } = await supabase
      .from('gyms')
      .select('id, name, images')
      .limit(5)

    if (error) {
      console.error('Error fetching gyms:', error)
    } else {
      setGyms(data || [])
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">Image Debug Information</h3>
      {gyms.map((gym) => (
        <div key={gym.id} className="mb-4 p-4 bg-white rounded border">
          <h4 className="font-semibold">{gym.name}</h4>
          <div className="mt-2">
            <strong>Images array:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
              {JSON.stringify(gym.images, null, 2)}
            </pre>
          </div>
          <div className="mt-2">
            <strong>Array length:</strong> {gym.images?.length || 0}
          </div>
          <div className="mt-2">
            <strong>Array type:</strong> {typeof gym.images}
          </div>
          {gym.images && gym.images.length > 0 && (
            <div className="mt-2">
              <strong>First URL:</strong>
              <p className="text-xs break-all">{gym.images[0]}</p>
              <div className="mt-2">
                <strong>Test image load:</strong>
                <img 
                  src={gym.images[0]} 
                  alt="Test" 
                  className="w-20 h-20 object-cover border rounded"
                  onLoad={() => console.log('Image loaded successfully:', gym.images[0])}
                  onError={(e) => {
                    console.error('Image failed to load:', gym.images[0])
                    console.error('Error details:', e)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 