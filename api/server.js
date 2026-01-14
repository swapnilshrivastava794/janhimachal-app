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
  "/api/nanhe-patrakar/login/",
  "/api/register/",
  "/api/auth/otp/",
  "/api/nanhe-patrakar/districts/",
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

// LOGIN → multipart/form-data
export function login(payload) {
  const formData = new FormData();
  formData.append('username', payload.username);
  formData.append('password', payload.password);
  
  return axiosInstance.post("/api/nanhe-patrakar/login/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// REGISTER → JSON
export function signup(payload) {
  return axiosInstance.post("/api/register/", payload);
}

// ----------------------------------------------------------
// NANHE PATRAKAR APIS
// ----------------------------------------------------------

// GET DISTRICTS
export function getDistricts() {
  return axiosInstance.get("/api/nanhe-patrakar/districts/");
}

// GET PARENT PROFILE
export function getParentProfile() {
  return axiosInstance.get("/api/nanhe-patrakar/parent-profile/");
}

// GET MY CHILD PROFILES
export function getMyChildProfiles() {
  return axiosInstance.get("/api/nanhe-patrakar/child-profiles/");
}

// GET CHILD PROFILES LIST (Public/Featured)
export function getChildProfilesList() {
  return axiosInstance.get("/api/nanhe-patrakar/child-profiles/list/");
}

// GET CHILD PROFILE DETAIL
export function getChildProfileDetail(id) {
  return axiosInstance.get(`/api/nanhe-patrakar/child-profiles/${id}/`);
}

// GET NANHE PATRAKAR TOPICS (Filters)
export function getNanhePatrakarTopics() {
  return axiosInstance.get("/api/nanhe-patrakar/topics/");
}

// GET NANHE PATRAKAR SUBMISSIONS
export function getSubmissions(params = {}) {
  // params: { topic_id, status, page, page_size }
  return axiosInstance.get("/api/nanhe-patrakar/submissions/", { params });
}

// CREATE NANHE PATRAKAR SUBMISSION
export function createSubmission(formData) {
  return axiosInstance.post("/api/nanhe-patrakar/submission/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// GET SUBMISSION DETAIL
export function getSubmissionDetail(id) {
  return axiosInstance.get(`/api/nanhe-patrakar/submissions/${id}/`);
}

// GET SUBMISSION STATS (Dashboard)
export function getSubmissionStats() {
  return axiosInstance.get("/api/nanhe-patrakar/submissions/stats/");
}

// UPDATE NORMAL PROFILE
export function updateNormalProfile(payload) {
  const formData = new FormData();
  Object.keys(payload).forEach(key => formData.append(key, payload[key]));
  return axiosInstance.put("/api/nanhe-patrakar/user/update/", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

// UPDATE CHILD PROFILE
export function updateChildProfile(childId, payload) {
  const formData = new FormData();
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      formData.append(key, payload[key]);
    }
  });
  return axiosInstance.put(`/api/nanhe-patrakar/child-profiles/${childId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

// UPDATE PARENT PROFILE
export function updateParentProfile(payload) {
  const formData = new FormData();
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      formData.append(key, payload[key]);
    }
  });
  return axiosInstance.put("/api/nanhe-patrakar/update/parent-profile/", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

// ENROLLMENT → multipart/form-data
export function enrollNanhePatrakar(payload) {
  const formData = new FormData();
  
  // Append all fields to FormData
  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== null) {
      formData.append(key, payload[key]);
    }
  });

  return axiosInstance.post("/api/nanhe-patrakar/enrollment/", formData, {
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



// RAZORPAY PAYMENT APIS
export function createRazorpayOrder() {
  return axiosInstance.post("/api/nanhe-patrakar/payment/create-order/");
}

export function verifyRazorpayPayment(payload) {
  // payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  return axiosInstance.post("/api/nanhe-patrakar/payment/verify/", payload);
}

export default axiosInstance;
