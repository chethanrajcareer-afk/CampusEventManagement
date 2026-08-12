import React, { useState } from 'react'
import EventForm from './components/EventForm'
import EventList from './components/EventList'

export default function App() {
  const [editingEvent, setEditingEvent] = useState(null)

  return (
    <div className="app-root">
      <div className="container">
        <h1 className="title">Campus Event Management</h1>

        <div className="layout">
          <div className="card">
            <EventForm editingEvent={editingEvent} onDone={() => setEditingEvent(null)} />
          </div>

          <div className="card">
            <EventList onEdit={(ev) => setEditingEvent(ev)} />
          </div>
        </div>
      </div>
    </div>
  )
}
