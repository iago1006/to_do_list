import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login, storeAuthToken } from '../auth.js';
import { Alert } from 'react-native';
import * as Font from 'expo-font';

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
                <Text style={styles.header}>LOGIN</Text>
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
                <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>

                <Text style={styles.registerText}>
                    ¿No tienes una cuenta? {' '}
                    <Text style={styles.registerLink} onPress={handleNavigateToRegister}>
                        Regístrate aquí
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
        textTransform: 'uppercase',
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
    loginButton: {
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
    registerText: {
        fontFamily: 'poppins-regular',
        marginTop: 30,
        color: 'black',
        fontSize: 16,
    },
    registerLink: {
        fontFamily: 'poppins-bold',
        paddingRight: 50,
        color: '#546df8',
        textDecorationLine: 'underline',
    }
});

export default LoginScreen;
