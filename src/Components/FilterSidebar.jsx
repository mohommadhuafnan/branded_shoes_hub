function FilterSidebar({ filters, setFilters, maxPrice }) {
  const sizes = ['28', '29', '30', '31', '32', '36', '37', '38', '39', '40', '41', '42', '43', '44']

  return (
    <aside className="filter-sidebar reveal-left" data-reveal>
      <div className="sidebar-block">
        <h3>Search</h3>
        <input
          type="text"
          className="filter-input"
          placeholder="Search shoes..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
      </div>

      <div className="sidebar-block">
        <h3>Sort By</h3>
        <select
          className="filter-input"
          value={filters.sortBy}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
        >
          <option value="featured">Featured</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
          <option value="rating">Best Rating</option>
        </select>
      </div>

      <div className="sidebar-block">
        <div className="range-head">
          <h3>Max Price</h3>
          <span>LKR {filters.maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="2500"
          max={maxPrice}
          step="100"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
        />
      </div>

      <div className="sidebar-block">
        <h3>Sizes</h3>
        <div className="sidebar-sizes">
          {sizes.map((size) => (
            <button
              type="button"
              key={size}
              className={filters.selectedSize === size ? 'size-btn active' : 'size-btn'}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  selectedSize: prev.selectedSize === size ? '' : size,
                }))
              }
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-block toggles">
        <label>
          <input
            type="checkbox"
            checked={filters.saleOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, saleOnly: e.target.checked }))}
          />
          Sale only
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.readyStockOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, readyStockOnly: e.target.checked }))}
          />
          Ready stock only
        </label>
      </div>

      <button
        type="button"
        className="btn btn-muted full"
        onClick={() =>
          setFilters({ search: '', sortBy: 'featured', maxPrice, selectedSize: '', saleOnly: false, readyStockOnly: false })
        }
      >
        Reset Filters
      </button>
    </aside>
  )
}

export default FilterSidebar
