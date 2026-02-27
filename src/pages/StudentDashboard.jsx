import { useEffect, useState } from "react";
import API from "../api/axios";

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  // Fetch helpers removed — data is fetched directly inside the effect

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
    // fetch my registrations separately
    (async () => {
      try {
        const myRes = await API.get("/events/my");
        if (mounted) setRegistrations(myRes.data || []);
      } catch (err) {
        console.log("Could not fetch registrations", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const registerEvent = async (id) => {
    try {
      const res = await API.post(`/events/${id}/register`);
      alert(res.data?.message || "Registered successfully");
      // refresh registrations
      const myRes = await API.get("/events/my");
      setRegistrations(myRes.data || []);
    } catch (error) {
      console.log(error);
      const msg = error?.response?.data?.message || "Could not register";
      alert(msg);
    }
  };

  const unregisterEvent = async (eventId) => {
    try {
      const res = await API.delete(`/events/${eventId}/unregister`);
      alert(res.data?.message || "Unregistered");
      const myRes = await API.get("/events/my");
      setRegistrations(myRes.data || []);
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Could not unregister");
    }
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Student Dashboard</h2>
        <div>
          <button className="small-btn" style={{ marginRight: 8 }} onClick={() => setShowProfile(true)}>Profile</button>
          <button className="small-btn logout-btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('user'); window.location.href = '/'; }}>Logout</button>
        </div>
      </div>

      <div className="section">
        <h3>Upcoming Events</h3>
        {events.length === 0 && <div className="event-card">No events available</div>}
        {events.map((event) => {
          const id = event._id || event.id;
          return (
            <div className="event-card" key={id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ marginBottom: 6 }}>{event.title || "Untitled event"}</h4>
                  <div style={{ fontSize: 13, color: "#555" }}>{formatDate(event.event_date || event.date)}</div>
                  <p style={{ marginTop: 8 }}>{event.description || "No description."}</p>
                </div>
                <div>
                  <button className="small-btn" onClick={() => registerEvent(id)}>Register</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="section">
        <h3>Resources</h3>
        {resources.length === 0 && <div className="resource-card">No resources yet</div>}
        {resources.map((res) => {
          const id = res._id || res.id || res.link || JSON.stringify(res).slice(0, 8);
          return (
            <div className="resource-card" key={id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ marginBottom: 6 }}>{res.title || "Untitled resource"}</h4>
                  <div style={{ fontSize: 13, color: "#555" }}>{res.description || ""}</div>
                </div>
                <div>
                  <a href={res.file_url || res.fileUrl || res.link || "#"} target="_blank" rel="noreferrer">
                    <button className="small-btn">Open</button>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="section">
        <h3>My Registrations</h3>
        {registrations.length === 0 && <div className="event-card">No registrations yet</div>}
        {registrations.map((r) => {
          const id = r.id || r.event_id || r.eventId || JSON.stringify(r).slice(0, 8);
          return (
            <div className="event-card" key={id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ marginBottom: 6 }}>{r.title || "Untitled"}</h4>
                  <div style={{ fontSize: 13, color: "#555" }}>{formatDate(r.event_date || r.event_date)}</div>
                </div>
                <div>
                  <button className="small-btn" onClick={() => unregisterEvent(r.id || r.id || r.event_id || r.id)}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
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

export default StudentDashboard;
