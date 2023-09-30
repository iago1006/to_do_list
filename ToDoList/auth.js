import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.14:3000';

// Función para almacenar el token de autenticación en el almacenamiento local
export const storeAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
    console.log('Token de autenticación almacenado en el almacenamiento local');
  } catch (error) {
    console.error('Error al almacenar el token de autenticación en el almacenamiento local:', error);
  }
};

// Función para eliminar el token de autenticación del almacenamiento local
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    console.log('Token de autenticación eliminado del almacenamiento local');
  } catch (error) {
    console.error('Error al eliminar el token de autenticación del almacenamiento local:', error);
  }
};

// Función para obtener el token de autenticación del almacenamiento local
export const getAuthToken = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    return authToken;
  } catch (error) {
    console.error('Error al obtener el token de autenticación del almacenamiento local:', error);
    return null;
  }
};

// Función para realizar el inicio de sesión
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

// Función para realizar el registro de usuarios
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