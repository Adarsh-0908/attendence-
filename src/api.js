const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('faculty_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async signup(data) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async signin(data) {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Students
  async getStudents(branch, division) {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (division) params.append('division', division);
    const res = await fetch(`${API_BASE}/students?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async addStudent(student) {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(student)
    });
    return handleResponse(res);
  },

  async bulkAddStudents(students, branch, division) {
    const res = await fetch(`${API_BASE}/students/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ students, branch, division })
    });
    return handleResponse(res);
  },

  async removeStudent(id) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Subjects
  async getSubjects(branch, division) {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (division) params.append('division', division);
    const res = await fetch(`${API_BASE}/subjects?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async addSubject(subject) {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(subject)
    });
    return handleResponse(res);
  },

  async removeSubject(id) {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Attendance
  async getAttendance(branch, division, subjectId, date) {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (division) params.append('division', division);
    if (subjectId) params.append('subjectId', subjectId);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/attendance?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async saveAttendance(data) {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAttendance(id) {
    const res = await fetch(`${API_BASE}/attendance/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Excel Export
  async downloadExcel({ branch, division, subjectId, date }) {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (division) params.append('division', division);
    if (subjectId) params.append('subjectId', subjectId);
    if (date) params.append('date', date);

    const res = await fetch(`${API_BASE}/export-excel?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || 'Failed to download Excel file');
    }

    // Trigger browser download
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    let filename = `Attendance_${branch}_${division}.xlsx`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return filename;
  }
};
