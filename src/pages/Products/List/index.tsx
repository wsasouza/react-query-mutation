/* eslint-disable no-undef */
import React from 'react'
import Axios from 'axios'
import { IProduct } from '../../../types/IProduct'
import { useMutation, useQuery, useQueryClient } from 'react-query'

const fetchProducts = async () => {
  const response = await Axios.get(`http://localhost:3333/products`)
  return response.data
}

const saveProduct = async (product: IProduct) => {
  const response = await Axios.post(`http://localhost:3333/products`, product)
  return response.data
}

type ProductsListProps = {
  onProductDetail: (id: number) => void
}

export const ProductList = ({ onProductDetail }: ProductsListProps) => {
  const queryClient = useQueryClient()
  const queryKey = ['products']

  const { data: products, isLoading } = useQuery<IProduct[]>(queryKey, () =>
    fetchProducts(),
  )

  /* 
    Mutation
    
    1. React Query updates the cache
    2. Re-render
    3. Await the response from server
    
    Case success
    	Replace the old object by the new object
    	
    Case error
    	Remove the cache object
    */

  const mutation = useMutation(saveProduct, {
    onMutate: async (updatedProduct) => {
      // cancel the current queries
      await queryClient.cancelQueries(queryKey)

      // get current (previous) state
      const previousState = queryClient.getQueryData(queryKey)

      // update the current cache
      queryClient.setQueryData<IProduct[]>(queryKey, (oldState) => {
        return [...(oldState ?? []), updatedProduct]
      })

      return { previousState }
    },
    onError: async (_err, variables, context) => {
      const { previousState } = context as { previousState: IProduct[] }
      queryClient.setQueryData(queryKey, previousState)
    },
    onSettled: async () => {
      queryClient.invalidateQueries(queryKey)
    },
  })

  if (isLoading || !products) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Produtos</h1>

      <label htmlFor="name">Adicionar produto:</label>
      <form
        id="form"
        onSubmit={(event) => {
          event.preventDefault()

          const formData = new FormData(event.currentTarget)
          const name = formData.get('name')
          const price = formData.get('price')
          const description = formData.get('description')
          const image = formData.get('image')

          const newProduct = {
            name,
            price,
            description,
            image,
          } as IProduct

          mutation.mutate(newProduct)
        }}
      >
        <ul>
          <li>
            <label htmlFor="name">Nome:</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Digite o nome"
            />
          </li>
          <li>
            <label htmlFor="price">Preço:</label>
            <input
              id="price"
              type="text"
              name="price"
              placeholder="Digite o preço"
            />
          </li>
          <li>
            <label htmlFor="description">Descrição:</label>
            <input
              id="description"
              type="text"
              name="description"
              placeholder="Digite a descrição"
            />
          </li>
          <li>
            <label htmlFor="image">URL da imagem:</label>
            <input
              id="image"
              type="text"
              name="image"
              placeholder="Digite a URL da imagem"
            />
          </li>
          <li>
            <button type="reset">Reset</button>
            <button type="submit">SALVAR</button>{' '}
          </li>
        </ul>
      </form>

      <label>Lista de produtos:</label>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ação</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id ?? new Date().getTime()}>
              <td>{product.id ?? '...'}</td>
              <td>{product.name}</td>
              <td>
                <a
                  href="#"
                  onClick={() => {
                    onProductDetail(product.id)
                  }}
                >
                  Detalhe
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
