import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import WhyUs from '../components/WhyUs'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <Hero onShopClick={() => navigate('/shop')} />
      <WhyUs />
    </div>
  )
}
