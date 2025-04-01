const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper to handle fetch with proper error handling
const fetchWithAuth = async (url, options = {}) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Set authorization header if token exists
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // Parse JSON response
  const data = await response.json();

  // Handle error responses
  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
};

// Authentication API methods
export const auth = {
  login: (credentials) =>
    fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () => fetchWithAuth("/api/users/me"),
};

// Protected API methods for users
export const users = {
  getProfile: () => fetchWithAuth("/api/users/me"),

  updateProfile: (userData) =>
    fetchWithAuth("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(userData),
    }),
};

// Transcription API methods
export const transcription = {
  // Get all transcription jobs
  getJobs: () => fetchWithAuth("/api/transcription"),

  // Get a specific job
  getJob: (id) => fetchWithAuth(`/api/transcription/${id}`),

  // Create a new transcription job (file upload)
  createJob: async (formData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/transcription`, {
      method: "POST",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: formData,
    });
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(err.message || "Failed to upload file");
      });
    }
    return await response.json();
  },

  // Delete a job
  deleteJob: (id) =>
    fetchWithAuth(`/api/transcription/${id}`, {
      method: "DELETE",
    }),
};
