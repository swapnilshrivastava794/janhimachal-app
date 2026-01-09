import constant from '@/constants/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    avatar?: string; // API doesn't return this yet, keeping optional
    stats?: {        // API doesn't return this yet, keeping optional
        savedNews: number;
        savedVideos: number;
        savedArticles: number;
    }
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('userToken');
            if (userData && token) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${constant.appBaseUrl}/api/auth/login/`, {
                email,
                password
            });
            
            if (response.data.status === 'success') {
                const { user, tokens } = response.data;
                // Add mock stats/avatar if missing, to avoid breaking UI that depends on it
                const userWithStats = {
                    ...user,
                    avatar: user.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop',
                    stats: user.stats || {
                        savedNews: 0,
                        savedVideos: 0,
                        savedArticles: 0
                    }
                };
                
                await AsyncStorage.setItem('user', JSON.stringify(userWithStats));
                await AsyncStorage.setItem('userToken', tokens.access);
                await AsyncStorage.setItem('refreshToken', tokens.refresh);
                setUser(userWithStats);
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    };

    const signup = async (data: any) => {
        try {
            const response = await axios.post(`${constant.appBaseUrl}/api/auth/signup/`, data);
            
            if (response.data.status === 'success') {
                // After signup, we might want to auto-login or just return success
                // For now, let's assume we redirect to login or auto-login if token was provided (API docs show user data but no token on signup response)
                // If the API allows immediate login, we would need tokens. 
                // The provided signup response ONLY has user data, no tokens.
                // So we probably can't set user session yet unless we strictly trust the signup response or call login automatically.
                // For better UX, let's just return and let the UI guide them to login or auto-login.
                
                // If you want to auto-login, you'd need the password again, which is in `data`.
                // Let's attempt auto-login for seamless experience if the signup flow allows.
                if (data.password && data.email) {
                    await login(data.email, data.password);
                }
            } else {
                throw new Error(response.data.message || 'Signup failed');
            }
        } catch (error: any) {
            console.error('Signup error:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('refreshToken');
            setUser(null);
        } catch (error) {
            console.error(error);
        }
    };

    const updateProfile = async (data: any) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error('No access token found');

            const response = await axios.post(`${constant.appBaseUrl}/api/auth/update-profile/`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 'success') {
                const updatedData = response.data.data;
                // Merge updated data with existing user data (preserving stats/avatar if not returned)
                const currentUser = await AsyncStorage.getItem('user');
                const parsedUser = currentUser ? JSON.parse(currentUser) : {};
                
                const newUser = {
                    ...parsedUser,
                    ...updatedData
                };
                
                await AsyncStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
            } else {
                throw new Error(response.data.message || 'Profile update failed');
            }
        } catch (error: any) {
            console.error('Update Profile error:', error.response?.data || error.message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
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
