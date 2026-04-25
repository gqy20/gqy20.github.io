import { useState, useEffect, useRef } from 'react'

let cachedData = null
let cachePromise = null

export function useProjectsData() {
  const [data, setData] = useState(() => cachedData)
  const [loading, setLoading] = useState(() => !cachedData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cachedData) {
      setData(cachedData)
      setLoading(false)
      return
    }

    if (cachePromise) {
      cachePromise.then(d => { setData(d); setLoading(false) }).catch(e => setError(e))
      return
    }

    setLoading(true)
    cachePromise = import('../data/projects.json')
      .then(module => {
        cachedData = module.default
        setData(cachedData)
        setLoading(false)
        return cachedData
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })

    return () => {}
  }, [])

  return { data, loading, error }
}
