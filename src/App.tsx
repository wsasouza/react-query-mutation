import React, { useState } from 'react'
import './App.css'
import { ProductDetail } from './pages/Products/Detail'
import { ProductList } from './pages/Products/List'

function App() {
  const [productId, setProductId] = useState<number | null>(null)

  const onProductDetail = (id: number) => {
    setProductId(id)
  }

  const onBackToList = () => {
    setProductId(null)
  }

  return (
    <div className="app">
      <div className="default">
        <h1>Mutation com React Query</h1>
        <hr />
        {productId !== null ? (
          <ProductDetail id={productId} onBack={onBackToList} />
        ) : (
          <ProductList onProductDetail={onProductDetail} />
        )}
      </div>
    </div>
  )
}

export default App
