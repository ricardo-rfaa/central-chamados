import { useState, useEffect } from 'react'

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => isCompactViewport())

  useEffect(() => {
    const update = () => setMobile(isCompactViewport())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return mobile
}

function isCompactViewport() {
  const { innerWidth: width, innerHeight: height } = window
  return width < 900 || (width > height && height < 500)
}
