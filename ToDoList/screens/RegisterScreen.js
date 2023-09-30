import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register } from '../auth.js';
import { Alert } from 'react-native';

const RegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigation = useNavigation();

    const handleRegister = async () => {
        try {
            const response = await register(username, password, email);
            setUsername('');
            setPassword('');
            setEmail('');
            if (response.message === 'Usuario registrado correctamente') {
                Alert.alert('Registro exitoso', 'Usuario correctamente registrado', [
                    { text: 'OK', onPress: () => navigation.navigate('LoginScreen') },
                ]);
            } else {
                console.error('Error de registro:', response);
                Alert.alert('Error de registro', 'No se pudo registrar al usuario.');
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.data.error) {
                    case 'INVALID_EMAIL':
                        Alert.alert('Error de registro', 'El correo electrónico no es válido');
                        break;
                    case 'EMPTY_USERNAME':
                        Alert.alert('Error de registro', 'El nombre de usuario no puede estar vacío');
                        break;
                    case 'USERNAME_ALREADY_EXISTS':
                        Alert.alert('Error de registro', 'El nombre de usuario ya está en uso');
                        break;
                    case 'PASSWORD_TOO_SHORT':
                        Alert.alert('Error de registro', 'La contraseña debe tener al menos 8 caracteres');
                        break;
                    default:
                        console.error('Error de registro:', error);
                        Alert.alert('Error de registro', 'Ocurrió un error al intentar registrarse.');
                        break;
                }
            } else {
                console.error('Error de registro:', error);
                Alert.alert('Error de registro', 'No se pudo conectar al servidor.');
            }
        }
    };

    const handleNavigateToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <ImageBackground
            source={require('../images/background.jpg')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Text style={styles.header}>Registrarse</Text>
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
                <TextInput
                    placeholder="Correo Electrónico"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>
                <Text style={styles.loginText} onPress={handleNavigateToLogin}>
                    ¿Ya tienes una cuenta? Inicia sesión aquí
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
    registerButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    loginText: {
        marginTop: 20,
        color: 'blue',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;
