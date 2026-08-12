import React, { useEffect, useState } from 'react'
import api from '../api'

export default function EventList({ onEdit }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/events')
      setEvents(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await api.delete(`/api/events/${id}`)
      setEvents((s) => s.filter((e) => e._id !== id))
    } catch (err) {
      alert(err?.response?.data?.error || err.message)
    }
  }

  return (
    <div>
      <h2 className="list-title">Events</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}

      <div className="list">
        {events.length === 0 && !loading && <div>No events yet</div>}

        {events.map((ev) => (
          <div key={ev._id} className="list-item">
            <div>
              <div className="item-title">{ev.eventName}</div>
              <div className="muted">{ev.eventType} • {ev.resourcePerson || '—'}</div>
              <div className="muted">{new Date(ev.eventDate).toLocaleDateString()} • {ev.venue || '—'}</div>
              <div className="muted">Status: {ev.registrationStatus} • Max: {ev.maxParticipants || '—'}</div>
            </div>
            <div className="item-actions">
              <button onClick={() => onEdit(ev)} className="btn">Edit</button>
              <button onClick={() => remove(ev._id)} className="btn btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
