import axios from "axios";

// const setBaseUrl = axios.create({
//   baseURL: 'https://sipena.site/api',
//   headers: {
//     'Content-Type': 'application/json', // WAJIB ADA!
//   }
// }); 

const setBaseUrl = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json', // WAJIB ADA!
  }
}); 

setBaseUrl.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${String(token||"")}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default setBaseUrl;