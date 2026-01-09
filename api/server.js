import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import constant from "../constants/constant";

// ----------------------------------------------------------
// AXIOS INSTANCE
// ----------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: constant.appBaseUrl,
});

// ----------------------------------------------------------
// PUBLIC ENDPOINTS (No token needed)
// ----------------------------------------------------------
const publicEndpoints = [
  "api/auth/login/",
  "/api/auth/register/",
  "/api/auth/otp/",
];

// ----------------------------------------------------------
// REQUEST INTERCEPTOR → Attach token for protected APIs
// ----------------------------------------------------------
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  const isPublic = publicEndpoints.some((endpoint) =>
    config.url.includes(endpoint)
  );

  if (!isPublic && token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// ----------------------------------------------------------
// RESPONSE INTERCEPTOR (Auto-Refresh Logic)
// ----------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // IF 401 Unauthorized AND NOT already retried
    const isLoginRequest = originalRequest.url && originalRequest.url.includes("api/auth/login");
    
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
            // No refresh token -> Logout
            await logoutUser();
            return Promise.reject(error);
        }

        // Call Refresh API
        // Adjust endpoint based on your backend: /api/token/refresh/ is common
        const res = await axios.post(`${constant.appBaseUrl}/api/token/refresh/`, {
            refresh: refreshToken
        });

        if (res.data.access) {
            await saveToken(res.data.access, res.data.refresh || refreshToken);
            
            // Retry original request with new token
            originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
            return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed -> Logout
        console.log("❌ REFRESH FAILED:", refreshError?.response?.data || refreshError.message);
        console.log("Session expired, logging out...");
        await logoutUser();
        return Promise.reject(refreshError);
      }
    }

    console.log("🔥 AXIOS ERROR:", JSON.stringify(error, null, 2));

    if (error.response) {
      return Promise.reject(error.response.data);
    }
    if (error.request) {
      return Promise.reject("Server did not respond");
    }
    return Promise.reject(error.message);
  }
);


// ----------------------------------------------------------
// TOKEN HELPERS
// ----------------------------------------------------------
export async function saveToken(accessToken, refreshToken) {
  await AsyncStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    await AsyncStorage.setItem("refreshToken", refreshToken);
  }
}

export async function logoutUser() {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
}

// ----------------------------------------------------------
// AUTH APIS (ONLY THESE ARE ACTIVE NOW)
// ----------------------------------------------------------

// LOGIN → JSON body
export function login(payload) {
  return axiosInstance.post("/api/auth/login/", payload);
}

// REGISTER → multipart/form-data
export function signup(formData) {
  return axiosInstance.post("/api/auth/register/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}




export function getCategories() {
  return axiosInstance.get("/api/categories/", {
    headers: {
      Accept: "application/json",
    },
  });
}

// ----------------------------------------------------------
// NEWS / VIDEO APIs
// ----------------------------------------------------------
export const getNews = async (params = {}) => {
  // params: { subcategory_id, video_type, breaking, trending, headlines, articles, page, limit }
  const res = await axiosInstance.get("/api/news/", {
    params,
  });
  return res.data;
};

export const getNewsDetail = async (id) => {
  const res = await axiosInstance.get(`/api/news/${id}/`);
  return res.data;
};

export const getVideos = async (params = {}) => {
  const res = await axiosInstance.get("/api/videos/", {
    params,
  });
  return res.data;
};

export const getVideoDetail = async (id) => {
  const res = await axiosInstance.get(`/api/videos/${id}/`);
  return res.data;
};

export const searchNews = async (query, params = {}) => {
  const res = await axiosInstance.get("/api/search/", {
    params: { q: query, ...params },
  });
  return res.data;
};



export default axiosInstance;
