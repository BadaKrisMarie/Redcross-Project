export default function NotificationsModal({ notifications, loading, onClose, onMarkAllRead, onMarkOneRead }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Notifications</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body" style={{ gap: 0 }}>
          {loading ? (
            <p className="notif-empty">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="notif-empty">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item${n.is_read ? ' read' : ''}`}
                onClick={() => !n.is_read && onMarkOneRead(n.id)}
                role={n.is_read ? undefined : 'button'}
                tabIndex={n.is_read ? undefined : 0}
                onKeyDown={(e) => e.key === 'Enter' && !n.is_read && onMarkOneRead(n.id)}
              >
                <div className={`notif-dot${n.is_read ? ' read' : ''}`} />
                <div>
                  <div className="notif-text">{n.message}</div>
                  <div className="notif-time">{n.created_at}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onMarkAllRead}>
            Mark all read
          </button>
          <button className="btn-save" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
