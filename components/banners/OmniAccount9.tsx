import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export const OmniAccount9 = ({
  width,
  height,
}: {
  width: number
  height: number
}) => {
  const [src, setSrc] = useState<string>(
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  )
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    switch (resolvedTheme) {
      case 'light':
        setSrc('/banners/omniaccount_9_light.jpg')
        break
      case 'dark':
        setSrc('/banners/omniaccount_9_light.jpg')
        break
    }
  }, [resolvedTheme])

  return <Image src={src} width={width} height={height} alt="Omni Account" />
}
