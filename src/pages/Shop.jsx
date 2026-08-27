import { useEffect, useState } from 'react'
import Products from '../components/Products'

export default function Shop({ products, onAddToCart, onCartClick }) {
  const [localProducts, setLocalProducts] = useState([])

  useEffect(() => {
    if (products && products.length > 0) {
      setLocalProducts(products)
    } else {
      // Fallback products if none provided
      setLocalProducts([
        {
          id: 1,
          name: 'Tomatoes',
          image: '🍅',
          price: 70,
          unit: '1kg',
          category: 'vegetables',
        },
        {
          id: 2,
          name: 'Kale',
          image: '🥬',
          price: 50,
          unit: 'bunch',
          category: 'vegetables',
        },
        {
          id: 3,
          name: 'Carrots',
          image: '🥕',
          price: 40,
          unit: '500g',
          category: 'vegetables',
        },
        {
          id: 4,
          name: 'Apples',
          image: '🍎',
          price: 100,
          unit: '1kg',
          category: 'fruits',
        },
        {
          id: 5,
          name: 'Bananas',
          image: '🍌',
          price: 60,
          unit: 'bunch',
          category: 'fruits',
        },
        {
          id: 6,
          name: 'Oranges',
          image: '🍊',
          price: 80,
          unit: '1kg',
          category: 'fruits',
        },
      ])
    }
  }, [products])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">
          🛒 Our Products
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Fresh produce delivered to your door
        </p>

        <Products
          products={localProducts}
          onAddToCart={onAddToCart}
          onCartClick={onCartClick}
        />
      </div>
    </div>
  )
}
