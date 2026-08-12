import React, { useState, useEffect } from 'react'
import api from '../api'

const empty = {
  eventName: '',
  eventType: 'Workshop',
  resourcePerson: '',
  eventDate: '',
  venue: '',
  maxParticipants: '',
  registrationStatus: 'Open',
}

export default function EventForm({ editingEvent, onDone }) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(()=> {
    if (editingEvent) {
      setForm({
        ...editingEvent,
        eventDate: editingEvent.eventDate ? editingEvent.eventDate.split('T')[0] : '',
      })
    } else {
      setForm(empty)
    }
  }, [editingEvent])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((s) =>({ ...s, [name]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!form.eventName || !form.eventType || !form.eventDate) {
      setMessage('Please fill required fields')
      return
    }
    if (form.maxParticipants && Number(form.maxParticipants) <= 0) {
      setMessage('Max participants must be positive')
      return
    }

    setLoading(true)
    try {
      if (editingEvent && editingEvent._id) {
        await api.put(`/api/events/${editingEvent._id}`, form)
        setMessage('Event updated')
      } else {
        await api.post('/api/events', form)
        setMessage('Event created')
        setForm(empty)
      }
      if (onDone) onDone()
    } catch (err) {
      setMessage(err?.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <h2 className="form-title">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>

      <div className="form-row">
        <label>Event Name*</label>
        <input name="eventName" value={form.eventName} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Type*</label>
        <select name="eventType" value={form.eventType} onChange={handleChange}>
          <option>Workshop</option>
          <option>Hackathon</option>
          <option>Seminar</option>
          <option>Masterclass</option>
          <option>Competition</option>
          <option>Other</option>
        </select>
      </div>

      <div className="form-row">
        <label>Resource Person</label>
        <input name="resourcePerson" value={form.resourcePerson} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Date*</label>
        <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Venue</label>
        <input name="venue" value={form.venue} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Max Participants</label>
        <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>Registration Status</label>
        <select name="registrationStatus" value={form.registrationStatus} onChange={handleChange}>
          <option>Open</option>
          <option>Closed</option>
        </select>
      </div>

      {message && <div className="form-error">{message}</div>}

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={() => { setForm(empty); if (onDone) onDone() }} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
