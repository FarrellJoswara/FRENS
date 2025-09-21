import React, { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"

export default function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDateInfo, setSelectedDateInfo] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [eventTitle, setEventTitle] = useState("")

  // Helper functions
  const addDays = (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const today = new Date()

  // Events data
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Past Event',
      start: addDays(today, -2).toISOString().split('T')[0],
      className: 'fc-event-info'
    },
    {
      id: '2',
      title: 'All Day Event',
      start: addDays(today, 2).toISOString().split('T')[0],
      className: 'fc-event-info'
    },
    {
      id: '3',
      title: 'Long Event',
      start: addDays(today, 2).toISOString().split('T')[0],
      end: addDays(today, 5).toISOString().split('T')[0],
      className: 'fc-event-primary'
    },
    {
      id: '4',
      title: 'Confirm tech stack',
      start: addDays(today, 0).toISOString().split('T')[0] + 'T10:00:00',
      end: addDays(today, 0).toISOString().split('T')[0] + 'T18:00:00',
      className: 'fc-event-success'
    },
    {
      id: '5',
      groupId: '999',
      title: 'Coding session',
      start: addDays(today, 1).toISOString().split('T')[0] + 'T16:00:00',
      className: 'fc-event-secondary'
    },
    {
      id: '6',
      groupId: '999',
      title: 'Coding session',
      start: addDays(today, 8).toISOString().split('T')[0] + 'T16:00:00',
      className: 'fc-event-secondary'
    },
    {
      id: '7',
      title: 'Conference',
      start: addDays(today, 9).toISOString().split('T')[0],
      end: addDays(today, 10).toISOString().split('T')[0],
      className: 'fc-event-primary'
    },
    {
      id: '8',
      title: 'Meeting',
      start: addDays(today, 9).toISOString().split('T')[0] + 'T10:30:00',
      end: addDays(today, 9).toISOString().split('T')[0] + 'T12:30:00',
      className: 'fc-event-error'
    },
    {
      id: '9',
      title: 'Lunch',
      start: addDays(today, 9).toISOString().split('T')[0] + 'T12:40:00',
      className: 'fc-event-warning'
    },
    {
      id: '10',
      title: 'Meeting',
      start: addDays(today, 9).toISOString().split('T')[0] + 'T14:30:00',
      className: 'fc-event-error'
    },
    {
      id: '11',
      title: 'Picnic',
      start: addDays(today, 12).toISOString().split('T')[0],
      className: 'fc-event-success'
    },
    {
      id: '12',
      title: 'Yoga',
      start: addDays(today, 15).toISOString().split('T')[0],
      className: 'fc-event-info'
    },
    {
      id: '13',
      title: 'Credit Card Payment',
      start: addDays(today, 23).toISOString().split('T')[0],
      end: addDays(today, 24).toISOString().split('T')[0],
      className: 'fc-event-warning'
    },
    {
      id: '14',
      title: 'Meeting with client',
      start: addDays(today, 27).toISOString().split('T')[0],
      className: 'fc-event-success'
    },
    {
      id: '15',
      start: addDays(today, 17).toISOString().split('T')[0],
      end: addDays(today, 20).toISOString().split('T')[0],
      display: 'background',
      className: 'fc-event-disabled'
    }
  ])

  // Handle date selection
  const handleSelect = (info) => {
    // Check if the selected range overlaps with the blocked range
    const blockedStart = addDays(today, 17).getTime()
    const blockedEnd = addDays(today, 20).getTime()
    const selectedStart = info.start.getTime()
    const selectedEnd = info.end ? info.end.getTime() : selectedStart

    if (
      (selectedStart < blockedEnd && selectedEnd > blockedStart) ||
      (selectedEnd > blockedStart && selectedStart < blockedEnd)
    ) {
      alert('Events cannot be added in the blocked date range.')
      info.view.calendar.unselect()
      return
    }

    setSelectedEvent(null)
    setSelectedDateInfo(info)
    setEventTitle("")
    setShowModal(true)
    info.view.calendar.unselect()
  }

  // Handle event click
  const handleEventClick = (info) => {
    setSelectedEvent(info.event)
    setSelectedDateInfo(null)
    setEventTitle(info.event.title)
    setShowModal(true)
  }

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (eventTitle.trim()) {
      if (selectedEvent) {
        // Update existing event
        const updatedEvents = events.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, title: eventTitle.trim() }
            : event
        )
        setEvents(updatedEvents)
      } else {
        // Add new event
        const newEvent = {
          id: String(Date.now()),
          title: eventTitle.trim(),
          start: selectedDateInfo.startStr,
          end: selectedDateInfo.endStr,
          allDay: true
        }
        setEvents([...events, newEvent])
      }
      setShowModal(false)
      setEventTitle("")
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Calendar</h2>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={today.toISOString().split('T')[0]}
        editable={true}
        dragScroll={true}
        dayMaxEvents={2}
        eventResizableFromStart={true}
        selectable={true}
        headerToolbar={{
          left: 'prev,next title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }}
        buttonText={{
          month: 'Month',
          week: 'Week',
          day: 'Day',
          list: 'List'
        }}
        events={events}
        select={handleSelect}
        eventClick={handleEventClick}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        allDayText="All day"
        height="auto"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedEvent ? 'Edit Event' : 'Add Event'} - {
                selectedEvent 
                  ? formatDate(selectedEvent.start) 
                  : selectedDateInfo ? formatDate(selectedDateInfo.start) : ''
              }
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  id="eventTitle"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title..."
                  required
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {selectedEvent ? 'Update' : 'Add'} Event
                </button>

                <button
                    type="button" // must be "button" so it doesn’t submit the form
                    onClick={() => {
                        if (selectedEvent) {
                        setEvents(events.filter(event => event.id !== selectedEvent.id))
                        setSelectedEvent(null) // close modal or reset selection
                        setShowModal(false)    // optional: close the modal
                        }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                    Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS for event styling */}
      <style jsx>{`
        .fc-event-info { background-color: #3b82f6 !important; border-color: #2563eb !important; }
        .fc-event-primary { background-color: #6366f1 !important; border-color: #4f46e5 !important; }
        .fc-event-success { background-color: #10b981 !important; border-color: #059669 !important; }
        .fc-event-secondary { background-color: #6b7280 !important; border-color: #4b5563 !important; }
        .fc-event-error { background-color: #ef4444 !important; border-color: #dc2626 !important; }
        .fc-event-warning { background-color: #f59e0b !important; border-color: #d97706 !important; }
        .fc-event-disabled { background-color: #f3f4f6 !important; opacity: 0.5 !important; }
      `}</style>
    </div>
  )
}