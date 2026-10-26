import { Navigate, useParams } from 'react-router-dom'
import { byproductTypeFromSlug } from '../../lib/constants'
import { ByProductsPage } from './ByProductsPage'

export function ByProductRoute() {
  const { slug } = useParams<{ slug: string }>()
  const type = slug ? byproductTypeFromSlug(slug) : null
  if (!type) {
    return <Navigate to="/byproducts/bran" replace />
  }
  return <ByProductsPage productType={type} />
}
