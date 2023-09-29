import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register } from '../auth.js';

const RegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigation = useNavigation();

    const handleRegister = async () => {
        try {
            const user = await register(username, password, email);
            navigation.navigate('MainScreen');
            setUsername('');
            setPassword('');
            setEmail('');
        } catch (error) {
            console.error('Error de registro:', error.message);
            setUsername('');
            setPassword('');
            setEmail('');
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
