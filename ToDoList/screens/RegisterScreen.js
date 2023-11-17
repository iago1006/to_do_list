import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register } from '../auth.js';
import { Alert } from 'react-native';
import * as Font from 'expo-font';

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
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
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
    const [fontsLoaded, setFontsLoad] = useState(false);
    useEffect(() => {
        if (!fontsLoaded) {
            loadFonts();
        }
    });
    const loadFonts = async () => {
        await Font.loadAsync({
            'poppins-thin': require('../assets/fonts/Poppins-Thin.ttf'),
            'poppins-regular': require('../assets/fonts/Poppins-Regular.ttf'),
            'poppins-medium': require('../assets/fonts/Poppins-Medium.ttf'),
            'poppins-semibold': require('../assets/fonts/Poppins-SemiBold.ttf'),
            'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });
        setFontsLoad(true)
    }
    if (!fontsLoaded) {
        return (<View />);
    }
    return (
        <ImageBackground
            source={require('../images/fondo.png')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Text style={styles.header}>REGÍSTRATE</Text>
                <Text style={styles.label}>Nombre de Usuario</Text>
                <TextInput
                    value={username}
                    onChangeText={text => setUsername(text)}
                    style={styles.input}
                />
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                    value={password}
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                    style={styles.input}
                />
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>
                <Text style={styles.loginText}>
                    ¿Ya tienes una cuenta? {' '}
                    <Text style={styles.loginLink} onPress={handleNavigateToLogin}>
                        Inicia sesión aquí
                    </Text>
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
    },
    header: {
        fontSize: 30,
        marginBottom: 30,
        fontFamily: 'poppins-bold',
        color: '#3038d2',
    },
    label: {
        width: '80%',
        fontSize: 13,
        paddingTop: 17,
        marginBottom: 8,
        fontFamily: 'poppins-medium',
    },
    input: {
        fontFamily: 'poppins-regular',
        width: '80%',
        height: 45,
        borderColor: '#ECE9E9',
        marginBottom: 5,
        paddingHorizontal: 15,
        backgroundColor: '#ECE9E9',
        borderRadius: 5,
    },
    registerButton: {
        backgroundColor: '#546df8',
        padding: 15,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'poppins-regular',
        fontSize: 16,
    },
    loginText: {
        fontFamily: 'poppins-regular',
        marginTop: 30,
        color: 'black',
        fontSize: 16,
    },
    loginLink: {
        fontFamily: 'poppins-bold',
        paddingRight: 50,
        color: '#546df8',
        textDecorationLine: 'underline',
    }
});

export default RegisterScreen;
