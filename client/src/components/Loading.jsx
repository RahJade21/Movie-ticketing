import React, { useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {

  const { nextUrl } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { axios, getToken } = useAppContext()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const bookingId = params.get('bookingId')

    let interval = null

    const goNext = () => {
      if(nextUrl) navigate('/' + nextUrl)
      else navigate('/')
    }

    // If bookingId present, poll user's bookings until this booking is marked paid
    if (bookingId) {
      interval = setInterval(async () => {
        try {
          const { data } = await axios.get('/api/user/bookings', { headers: { Authorization: `Bearer ${await getToken()}` } })
          if (data.success) {
            const booking = data.bookings.find(b => b._id === bookingId)
            if (booking && booking.isPaid) {
              clearInterval(interval)
              goNext()
            }
          }
        } catch (err) {
          console.error('Error checking booking payment status:', err)
        }
      }, 3000)

      // fallback: stop polling after 60s and continue
      setTimeout(() => {
        if (interval) clearInterval(interval)
        goNext()
      }, 60000)
    } else {
      // No bookingId — fallback to previous behaviour
      const t = setTimeout(() => goNext(), 8000)
      return () => clearTimeout(t)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [location.search, nextUrl, navigate, axios, getToken])

  return (
    <div className='flex justify-center items-center h-[80vh]'>
      <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-primary'>
        
      </div>
    </div>
  )
}

export default Loading