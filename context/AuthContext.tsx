import constant from '@/constants/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    country?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    user_type?: string;
    avatar?: string; // API doesn't return this yet, keeping optional
    stats?: {        // API doesn't return this yet, keeping optional
        savedNews: number;
        savedVideos: number;
        savedArticles: number;
    }
}

export interface ParentProfile {
    id: number;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    mobile: string;
    city: string;
    district: {
        id: number;
        name: string;
        name_hindi: string | null;
    };
    program: {
        id: number;
        name: string;
        name_hindi: string;
        price: string;
    };
    children: {
        id: number;
        name: string;
        photo: string | null;
    }[];
    status: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    parentProfile: ParentProfile | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    updateUserType: (newType: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    //   useEffect(() => {
    //     console.log("🔍 AuthContext State Debug:");
    //     console.log("👤 User:", JSON.stringify(user, null, 2));
    //     console.log("👨‍👩‍👧 Parent Profile:", JSON.stringify(parentProfile, null, 2));
    //     AsyncStorage.getItem('accessToken').then(token => console.log("🔑 Access Token:", token));
    //   }, [user, parentProfile]);

    const checkUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('accessToken');
            if (userData && token) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                await refreshProfile();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            // console.log("🚀 Login API Request:");
            // console.log("🔗 URL:", `${constant.appBaseUrl}/api/nanhe-patrakar/login/`);
            // console.log("📦 Payload:", { username: email, password: password });

            const formData = new FormData();
            formData.append('username', email); // Using email as username
            formData.append('password', password);

            const response = await axios.post(`${constant.appBaseUrl}/api/nanhe-patrakar/login/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Handle the new response structure
            if (response.data.status === true) {
                const { access, refresh, user_id, user_type, first_name, last_name, email: userEmail } = response.data.data;

                // Create a user object with full details from the API
                const userWithStats: User = {
                    id: user_id,
                    user_type: user_type,
                    first_name: first_name,
                    last_name: last_name,
                    name: `${first_name || ''} ${last_name || ''}`.trim() || userEmail || email || 'User',
                    email: userEmail || (email.includes('@') ? email : ''),
                    username: userEmail?.split('@')[0] || (email.includes('@') ? email.split('@')[0] : email),
                    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop',
                    stats: {
                        savedNews: 0,
                        savedVideos: 0,
                        savedArticles: 0
                    }
                };

                await AsyncStorage.setItem('user', JSON.stringify(userWithStats));
                await AsyncStorage.setItem('accessToken', access);
                if (refresh) {
                    await AsyncStorage.setItem('refreshToken', refresh);
                }
                setUser(userWithStats);

                // Immediately fetch parent profile after login to avoid loading state on profile page
                if (user_type === 'nanhe_patrakar') {
                    try {
                        const { getParentProfile } = require('../api/server');
                        const profileResponse = await getParentProfile();
                        if (profileResponse.data && profileResponse.data.status && profileResponse.data.data.parent_profile) {
                            setParentProfile(profileResponse.data.data.parent_profile);
                        }
                    } catch (profileError) {
                        console.log('ℹ️ Could not fetch parent profile on login:', profileError);
                    }
                }
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            // console.error('Login error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : null) || error.message || 'Login failed';
            throw new Error(errorMsg);
        }
    };

    const signup = async (data: any) => {
        try {
            const payload = {
                username: data.username,
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName,
                password: data.password
            };

            const response = await axios.post(`${constant.appBaseUrl}/api/register/`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 || response.status === 201 || response.data.status === 'success') {
                // If the response contains tokens, we can auto-login
                if (response.data.access || response.data.tokens) {
                    const resData = response.data;
                    const tokens = resData.tokens || { access: resData.access, refresh: resData.refresh };
                    const userData = resData.user || resData;

                    const userWithStats = {
                        ...userData,
                        name: userData.name || `${userData.first_name} ${userData.last_name}`.trim() || data.email,
                        avatar: userData.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop',
                        stats: { savedNews: 0, savedVideos: 0, savedArticles: 0 }
                    };

                    await AsyncStorage.setItem('user', JSON.stringify(userWithStats));
                    await AsyncStorage.setItem('accessToken', tokens.access);
                    if (tokens.refresh) await AsyncStorage.setItem('refreshToken', tokens.refresh);
                    setUser(userWithStats);
                } else if (data.password && data.username) {
                    // Fallback to manual login if signup was successful but didn't return tokens
                    // Use username instead of email for login
                    await login(data.username, data.password);
                }
            } else {
                throw new Error(response.data.message || 'Signup failed');
            }
        } catch (error: any) {
            console.error('Signup error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message || 'Signup failed';
            throw new Error(errorMsg);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            setUser(null);
            setParentProfile(null);
        } catch (error) {
            console.error(error);
        }
    };

    const updateProfile = async (data: any) => {
        try {
            const { updateNormalProfile, updateParentProfile } = require('../api/server');

            let response;
            if (user?.user_type === 'nanhe_patrakar') {
                // console.log('🔄 AuthContext: Updating Parent Profile...');
                response = await updateParentProfile(data);
            } else {
                // console.log('🔄 AuthContext: Updating Normal User Profile...');
                response = await updateNormalProfile(data);
            }

            if (response.data && response.data.status) {
                // Refresh all profile data from server to stay in sync
                await refreshProfile();
                return response.data;
            } else {
                throw new Error(response.data.message || 'Profile update failed');
            }
        } catch (error: any) {
            console.error('Update Profile error:', error.response?.data || error.message);
            throw error;
        }
    };

    const updateUserType = async (newType: string) => {
        try {
            // console.log('🔄 AuthContext: Attempting to update user_type to:', newType);

            // 1. Update AsyncStorage
            const currentUserStr = await AsyncStorage.getItem('user');
            if (currentUserStr) {
                const parsed = JSON.parse(currentUserStr);
                const updated = { ...parsed, user_type: newType };
                await AsyncStorage.setItem('user', JSON.stringify(updated));
            }

            // 2. Update State using functional update to ensure we have latest data
            setUser((prevUser) => {
                if (!prevUser) {
                    // If state was null, maybe we can reconstruct from storage
                    return prevUser;
                }
                // console.log('✅ AuthContext: State updated for user:', prevUser.id);
                return { ...prevUser, user_type: newType };
            });

        } catch (error) {
            console.error('❌ Update UserType Error:', error);
        }
    };

    const refreshProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                // console.log('ℹ️ AuthContext: No token found, skipping profile refresh.');
                return;
            }

            // console.log('🔄 AuthContext: Refreshing Profile Data...');
            const { getParentProfile } = require('../api/server');
            const response = await getParentProfile();

            // console.log('📡 AuthContext: Parent Profile API Response:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.status) {
                const data = response.data.data;

                // Update basic user info
                const userData = data.user;
                let updatedUser: User | null = null;

                if (userData) {
                    updatedUser = {
                        ...user, // Keep existing fields like avatar/stats if any
                        id: userData.id,
                        email: userData.email,
                        username: userData.username,
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
                        user_type: (data.profile_exists || data.parent_profile) ? 'nanhe_patrakar' : user?.user_type
                    };

                    // Deep compare to prevent unnecessary re-renders
                    if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
                        // console.log('👤 AuthContext: Updating User Info:', updatedUser.name, 'Type:', updatedUser.user_type);
                        setUser(updatedUser);
                        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                }

                // Update Parent Profile info
                // EDITED: Relaxed condition - if parent_profile data exists, use it (even if profile_exists is false - e.g. payment pending)
                if (data.parent_profile) {
                    // console.log('🏘️ AuthContext: Parent Profile Found:', data.parent_profile.city);

                    // Only update if changed
                    if (JSON.stringify(data.parent_profile) !== JSON.stringify(parentProfile)) {
                        setParentProfile(data.parent_profile);
                    }

                    // Ensure user_type is updated
                    if (user?.user_type !== 'nanhe_patrakar') {
                        // We need to update user_type in state as well if it wasn't caught in the user update above
                        const baseUser = updatedUser || user;
                        if (baseUser) {
                            const updatedWithRole = { ...baseUser, user_type: 'nanhe_patrakar' };
                            if (JSON.stringify(updatedWithRole) !== JSON.stringify(user)) {
                                setUser(updatedWithRole);
                                await AsyncStorage.setItem('user', JSON.stringify(updatedWithRole));
                            }
                        }
                    }

                } else {
                    // console.log('ℹ️ AuthContext: No Parent Profile exists for this user.');
                    if (parentProfile !== null) {
                        setParentProfile(null);
                    }
                }
            }
        } catch (error: any) {
            console.error('❌ AuthContext: Refresh Profile Error:', error.response?.data || error.message);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            parentProfile,
            isLoading,
            login,
            signup,
            updateProfile,
            updateUserType,
            refreshProfile,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
