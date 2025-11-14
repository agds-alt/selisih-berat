import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#dc2626',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          W
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
