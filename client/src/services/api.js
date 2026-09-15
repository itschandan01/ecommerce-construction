// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default api;


// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 🔐 Attach token automatically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // or whatever key you use

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 🔥 ADD THIS INTERCEPTOR
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // SAME key as AuthContext
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://final-eccommerce.onrender.com/api",
});

// 🔐 Attach token to EVERY request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Handle expired / invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – logging out");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;


