
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Initial check function to determine mobile status
    const checkIsMobile = () => {
      // Check if running in a browser environment
      if (typeof window === 'undefined') return false
      
      // First priority: use matchMedia for responsive design
      if (window.matchMedia) {
        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
      }
      
      // Second priority: check window width directly
      if (window.innerWidth) {
        return window.innerWidth < MOBILE_BREAKPOINT
      }
      
      // Fallback: check user agent string for common mobile device identifiers
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    }

    // Set initial value
    setIsMobile(checkIsMobile())

    // Add resize listener (with debounce)
    let timeoutId: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(checkIsMobile())
      }, 100)
    }

    // Add event listeners
    window.addEventListener("resize", handleResize)
    
    // For iOS orientation change which sometimes doesn't trigger resize
    window.addEventListener("orientationchange", handleResize)
    
    // Some browsers need both
    if (window.matchMedia) {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      if (mql.addEventListener) {
        mql.addEventListener("change", handleResize)
      } else if ('addListener' in mql) {
        // For older browsers
        (mql as any).addListener(handleResize)
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      clearTimeout(timeoutId)
      
      if (window.matchMedia) {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
        if (mql.removeEventListener) {
          mql.removeEventListener("change", handleResize)
        } else if ('removeListener' in mql) {
          // For older browsers
          (mql as any).removeListener(handleResize)
        }
      }
    }
  }, [])

  return isMobile ?? false
}
