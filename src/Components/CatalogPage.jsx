import { useMemo, useState } from 'react'
import PageHero from './PageHero'
import ProductCard from './ProductCard'

function CatalogPage({
  eyebrow,
  title,
  description,
  products,
  image,
  hideHero = false
}) {
  const [search, setSearch] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceSort, setPriceSort] = useState('')
  const [ratingSort, setRatingSort] = useState('')
  const [saleOnly, setSaleOnly] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)

  const allSizes = useMemo(() => {
    const sizes = products.flatMap((product) => product.sizes || [])
    return [...new Set(sizes)]
  }, [products])

  const allCategories = useMemo(() => {
    const categories = products
      .map((product) => product.category)
      .filter(Boolean)
    return [...new Set(categories)]
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (search.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.title?.toLowerCase().includes(search.toLowerCase()) ||
          product.desc?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (selectedSize) {
      filtered = filtered.filter((product) =>
        product.sizes?.includes(selectedSize)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      )
    }

    if (saleOnly) {
      filtered = filtered.filter((product) => product.oldPrice)
    }

    if (inStockOnly) {
      filtered = filtered.filter((product) => product.inStock !== false)
    }

    if (priceSort === 'low-high') {
      filtered.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0))
    } else if (priceSort === 'high-low') {
      filtered.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0))
    }

    if (ratingSort === 'high-low') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (ratingSort === 'low-high') {
      filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0))
    }

    return filtered
  }, [
    products,
    search,
    selectedSize,
    selectedCategory,
    priceSort,
    ratingSort,
    saleOnly,
    inStockOnly
  ])

  const resetFilters = () => {
    setSearch('')
    setSelectedSize('')
    setSelectedCategory('')
    setPriceSort('')
    setRatingSort('')
    setSaleOnly(false)
    setInStockOnly(false)
  }

  return (
    <div className="page-shell">
      {!hideHero && (
        <PageHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          image={image}
          tall
        />
      )}

      <section className="catalog-layout section-gap">
        <aside className="filter-sidebar" data-reveal>
          <div className="sidebar-block">
            <h3>Search</h3>
            <input
              type="text"
              className="filter-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sidebar-block">
            <h3>Sort by Price</h3>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
            >
              <option value="">Default</option>
              <option value="low-high">Low to High</option>
              <option value="high-low">High to Low</option>
            </select>
          </div>

          <div className="sidebar-block">
            <h3>Sort by Rating</h3>
            <select
              value={ratingSort}
              onChange={(e) => setRatingSort(e.target.value)}
            >
              <option value="">Default</option>
              <option value="high-low">Highest Rating</option>
              <option value="low-high">Lowest Rating</option>
            </select>
          </div>

          {allCategories.length > 0 && (
            <div className="sidebar-block">
              <h3>Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sidebar-block">
            <h3>Choose Size</h3>
            <div className="sidebar-sizes">
              <button
                className={`size-btn ${selectedSize === '' ? 'active' : ''}`}
                onClick={() => setSelectedSize('')}
                type="button"
              >
                All
              </button>

              {allSizes.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <h3>More Filters</h3>
            <div className="toggles">
              <label>
                <input
                  type="checkbox"
                  checked={saleOnly}
                  onChange={(e) => setSaleOnly(e.target.checked)}
                />
                Sale Items Only
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                In Stock Only
              </label>
            </div>
          </div>

          <div className="sidebar-block">
            <button
              type="button"
              className="btn btn-secondary full"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </aside>

        <div className="catalog-main">
          <div className="catalog-toolbar" data-reveal>
            <div>
              {!hideHero && eyebrow && <span className="eyebrow">{eyebrow}</span>}
              <h2>{filteredProducts.length} Products Available</h2>
              <p>Use the filters to find your perfect pair.</p>
            </div>

            <div className="toolbar-chips">
              <span>Premium Quality</span>
              <span>Best Fit</span>
              <span>Fast Delivery</span>
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="empty-state">
                <div>
                  <h3>No products found</h3>
                  <p>Try changing the filters or search text.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CatalogPage