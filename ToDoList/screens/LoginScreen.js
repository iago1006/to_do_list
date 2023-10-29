import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login, storeAuthToken } from '../auth.js';
import { Alert } from 'react-native';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            const user = await login(username, password);

            await storeAuthToken(user.token);

            navigation.reset({
                index: 0,
                routes: [{ name: 'MainScreen' }],
            });
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    Alert.alert('Error de inicio de sesión', 'Las credenciales son incorrectas. Por favor, verifica tu nombre de usuario y contraseña.');
                } else {
                    console.error('Error de inicio de sesión:', error);
                    Alert.alert('Error de inicio de sesión', 'Ocurrió un error al intentar iniciar sesión.');
                }
            } else {
                console.error('Error de inicio de sesión:', error);
                Alert.alert('Error de inicio de sesión', 'No se pudo conectar al servidor.');
            }
            setUsername('');
            setPassword('');
        }
    };

    const handleNavigateToRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <ImageBackground
            source={require('../images/background.jpg')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Text style={styles.header}>Iniciar Sesión</Text>
                <TextInput
                    placeholder="Nombre de Usuario"
                    value={username}
                    onChangeText={text => setUsername(text)}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                    style={styles.input}
                />
                <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
                <Text style={styles.registerText} onPress={handleNavigateToRegister}>
                    ¿No tienes una cuenta? Regístrate aquí
                </Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        color: 'white',
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
    loginButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    registerText: {
        marginTop: 20,
        color: 'blue',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
