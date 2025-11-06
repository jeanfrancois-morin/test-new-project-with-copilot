import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/items`)
      if (!response.ok) throw new Error('Failed to fetch items')
      const data = await response.json()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const url = editingId 
        ? `${API_URL}/api/items/${editingId}`
        : `${API_URL}/api/items`
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save item')
      
      setFormData({ name: '', description: '' })
      setEditingId(null)
      await fetchItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({ name: item.name, description: item.description || '' })
    setEditingId(item.id)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')
      await fetchItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setEditingId(null)
    setError('')
  }

  return (
    <div className="App">
      <div className="container">
        <h1>React + Express + MySQL App</h1>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="form-container">
          <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description"
                rows="3"
                disabled={loading}
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add Item'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="items-container">
          <h2>Items List</h2>
          {loading && !items.length ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p className="no-items">No items yet. Add one above!</p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <small>Created: {new Date(item.created_at).toLocaleString()}</small>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)} disabled={loading}>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      disabled={loading}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
