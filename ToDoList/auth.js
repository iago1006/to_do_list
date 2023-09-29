
import axios from 'axios';

const API_URL = 'http://192.168.0.14:3000';

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (username, password, email) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username,
            password,
            email,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
