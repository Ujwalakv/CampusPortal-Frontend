/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", date: "" });
  const [resourceForm, setResourceForm] = useState({ title: "", file_url: "" });
  const [showProfile, setShowProfile] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await API.get("/resources");
      setResources(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [eventsRes, resourcesRes] = await Promise.all([
          API.get("/events"),
          API.get("/resources"),
        ]);
        if (mounted) {
          setEvents(eventsRes.data || []);
          setResources(resourcesRes.data || []);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/events", form);
      setForm({ title: "", description: "", date: "" });
      fetchEvents();
    } catch (error) {
      console.error(error.response || error);
      const msg = error.response?.data?.message || error.message || "Create failed";
      alert(msg);
    }
  };

  const handleResourceChange = (e) => setResourceForm({ ...resourceForm, [e.target.name]: e.target.value });

  const createResource = async (e) => {
    e.preventDefault();
    try {
      // server expects { title, link }
      await API.post("/resources", { title: resourceForm.title, link: resourceForm.file_url });
      setResourceForm({ title: "", file_url: "" });
      fetchResources();
      alert("Resource uploaded");
    } catch (err) {
      console.error(err.response || err);
      alert(err?.response?.data?.message || "Upload failed");
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error(error.response || error);
      const msg = error.response?.data?.message || error.message || "Delete failed";
      alert(msg);
    }
  };

  const formatDate = (d) => {
    try {
      // support both `event_date` (from DB) and `date` (client)
      const dateVal = d?.event_date || d?.date || d;
      return new Date(dateVal).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <div>
          <button className="small-btn" style={{ marginRight: 8 }} onClick={() => setShowProfile(true)}>Profile</button>
          <button className="small-btn logout-btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('user'); window.location.href = '/'; }}>Logout</button>
        </div>
      </div>

      <div className="section" style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, maxWidth: 380 }} className="card">
          <h3 style={{ marginBottom: 12 }}>Create Event</h3>
          <form onSubmit={createEvent}>
            <div className="input-group">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Event title" />
            </div>
            <div className="input-group">
              <input name="date" value={form.date} onChange={handleChange} type="date" />
            </div>
            <div className="input-group">
              <input name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
            </div>
            <button className="btn" type="submit">Create Event</button>
          </form>

          <hr style={{ margin: "18px 0" }} />

          <h3 style={{ marginBottom: 12 }}>Upload Resource</h3>
          <form onSubmit={createResource}>
            <div className="input-group">
              <input name="title" value={resourceForm.title} onChange={handleResourceChange} placeholder="Resource title" />
            </div>
            <div className="input-group">
              <input name="file_url" value={resourceForm.file_url} onChange={handleResourceChange} placeholder="File URL (https://...)" />
            </div>
            <button className="btn" type="submit">Upload Resource</button>
          </form>
        </div>

        <div style={{ flex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>All Events</h3>
            <div style={{ color: "#666" }}>{events.length} events</div>
          </div>

          <div className="section">
            {events.length === 0 && <div className="event-card">No events yet</div>}
            {events.map((event) => {
              const id = event._id || event.id;
              return (
                <div className="event-card" key={id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ marginBottom: 6 }}>{event.title || "Untitled event"}</h4>
                      <div style={{ fontSize: 13, color: "#555" }}>{formatDate(event.date)}</div>
                      <p style={{ marginTop: 8 }}>{event.description || "No description provided."}</p>
                    </div>
                    <div style={{ marginLeft: 12, textAlign: "right" }}>
                      <button className="small-btn logout-btn" onClick={() => deleteEvent(id)}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowProfile(false)}>
          <div style={{ background: 'white', padding: 20, borderRadius: 8, minWidth: 300 }} onClick={(e) => e.stopPropagation()}>
            <h3>Profile</h3>
            <div style={{ marginTop: 8 }}>
              {(() => {
                const u = localStorage.getItem('user');
                if (!u) return <div>No user info</div>;
                const user = JSON.parse(u);
                return (
                  <div>
                    <div><strong>Name:</strong> {user.name}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Role:</strong> {localStorage.getItem('role')}</div>
                  </div>
                )
              })()}
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button className="btn" onClick={() => setShowProfile(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
