import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import "./Calendar.css";
import CalBg from "../assets/calbg.svg";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState("month");
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    color: "#15223dff",
    repeat: "none",
    price: "", // price estimate
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  /** Handle selecting a date range */
  const handleDateSelect = (selectInfo) => {
    setNewEvent({
      title: "",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      color: "#202f4eff",
      repeat: "none",
      price: "",
    });
    setShowModal(true);
  };

  /** Handle clicking an event */
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowDetailsModal(true);
  };

  /** Add event with recurrence */
  const addEvent = () => {
    if (!newEvent.title.trim()) return;

    const baseEvent = { ...newEvent, id: Date.now().toString() };
    const newEvents = [baseEvent];

    const startDate = new Date(newEvent.start);
    const endDate = new Date(newEvent.end);
    const repeatCount = 10;

    if (newEvent.repeat !== "none") {
      for (let i = 1; i <= repeatCount; i++) {
        let nextStart = new Date(startDate);
        let nextEnd = new Date(endDate);

        if (newEvent.repeat === "daily") {
          nextStart.setDate(startDate.getDate() + i);
          nextEnd.setDate(endDate.getDate() + i);
        } else if (newEvent.repeat === "weekly") {
          nextStart.setDate(startDate.getDate() + i * 7);
          nextEnd.setDate(endDate.getDate() + i * 7);
        } else if (newEvent.repeat === "biweekly") {
          nextStart.setDate(startDate.getDate() + i * 14);
          nextEnd.setDate(endDate.getDate() + i * 14);
        }

        newEvents.push({
          ...newEvent,
          id: (Date.now() + i).toString(),
          start: nextStart.toISOString(),
          end: nextEnd.toISOString(),
        });
      }
    }

    setEvents([...events, ...newEvents]);
    setNewEvent({ title: "", start: "", end: "", color: "#2563eb", repeat: "none", price: "" });
    setShowModal(false);
  };

  /** Delete event */
  const deleteEvent = (eventId) => {
    setEvents(events.filter((e) => e.id !== eventId));
    setShowDetailsModal(false);
  };

  /** Filter upcoming events */
  const getFilteredEvents = () => {
    const now = new Date();
    const msInDay = 86400000;
    return events.filter((e) => {
      const eventDate = new Date(e.start);
      if (filter === "day") return eventDate.toDateString() === now.toDateString();
      if (filter === "week") {
        const weekFromNow = new Date(now.getTime() + 7 * msInDay);
        return eventDate >= now && eventDate <= weekFromNow;
      }
      if (filter === "month") {
        const monthFromNow = new Date(now);
        monthFromNow.setMonth(now.getMonth() + 1);
        return eventDate >= now && eventDate <= monthFromNow;
      }
      return true;
    });
  };

  return (
    <div className="calendar-root" style={{ backgroundImage: `url(${CalBg})` }}>
      <div className="calendar-overlay" />
      <section className="calendar-card">
        <header className="card-header">
          <h1 className="card-title">Rachel's Calendar</h1>
        </header>

        <div className="body-grid">
          {/* MAIN CALENDAR */}
          <div className="main">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDisplay="block"
              height="auto"
            />

            {/* ADD EVENT MODAL */}
            {showModal && (
              <div className="modal-backdrop">
                <div className="modal-card">
                  <h2 className="panel-title">Add Event</h2>
                  <input
                    type="text"
                    placeholder="Event title"
                    className="input"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                  <label className="label">Start Time:</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                  />
                  <label className="label">End Time:</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                  />
                  <label className="label">Color:</label>
                  <input
                    type="color"
                    className="input"
                    value={newEvent.color}
                    onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                  />
                  <label className="label">Repeat:</label>
                  <select
                    className="input"
                    value={newEvent.repeat}
                    onChange={(e) => setNewEvent({ ...newEvent, repeat: e.target.value })}
                  >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                  </select>
                  <label className="label">Price Estimate ($):</label>
                  <input
                    type="number"
                    className="input"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                  />
                  <div className="modal-actions">
                    <button className="btn secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button className="btn primary" onClick={addEvent}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EVENT DETAILS MODAL */}
            {showDetailsModal && selectedEvent && (
              <div className="modal-backdrop">
                <div className="modal-card">
                  <h2 className="panel-title">{selectedEvent.title}</h2>
                  <p>
                    <strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}
                  </p>
                  {selectedEvent.extendedProps.price && (
                    <p>
                      <strong>Price Estimate:</strong> ${selectedEvent.extendedProps.price}
                    </p>
                  )}
                  <div className="modal-actions">
                    <button className="btn secondary" onClick={() => setShowDetailsModal(false)}>
                      Close
                    </button>
                    <button className="btn primary" onClick={() => deleteEvent(selectedEvent.id)}>
                      Delete Event
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR: UPCOMING EVENTS */}
          <aside className="summary">
            <div className="summary-card">
              <div className="summary-header">
                <h2 className="panel-title">Upcoming Events</h2>
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${filter === "day" ? "active" : ""}`}
                    onClick={() => setFilter("day")}
                  >
                    Day
                  </button>
                  <button
                    className={`toggle-btn ${filter === "week" ? "active" : ""}`}
                    onClick={() => setFilter("week")}
                  >
                    Week
                  </button>
                  <button
                    className={`toggle-btn ${filter === "month" ? "active" : ""}`}
                    onClick={() => setFilter("month")}
                  >
                    Month
                  </button>
                </div>
              </div>
              {getFilteredEvents().length === 0 ? (
                <p className="hint">No events for this {filter}.</p>
              ) : (
                getFilteredEvents().map((e) => (
                  <div
                    key={e.id}
                    className="row upcoming-event"
                    style={{ borderLeft: `6px solid ${e.color}` }}
                  >
                    <span>{e.title}</span>
                    <strong>{new Date(e.start).toLocaleString()}</strong>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
