// resources/js/services/api.js
export async function getNotifications() {
  const res = await fetch('/admin/notifications', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markAllRead() {
  const res = await fetch('/admin/notifications/mark-all-read', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
    },
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
  return res.json();
}

export async function markOneRead(id) {
  const res = await fetch(`/admin/notifications/${id}/mark-read`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
    },
  });
  if (!res.ok) throw new Error('Failed to mark as read');
  return res.json();
}