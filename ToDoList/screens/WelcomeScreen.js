import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import * as Font from 'expo-font';

const WelcomeScreen = ({ navigation }) => {
    const [fontsLoaded, setFontsLoad] = useState(false);
    useEffect(() => {
        if (!fontsLoaded) {
            loadFonts();
        }
    });
    const loadFonts = async () => {
        await Font.loadAsync({
            'quicksand-bold': require('../assets/fonts/Quicksand_Bold.otf'),
            'quicksand-book': require('../assets/fonts/Quicksand_Book.otf'),
            'quicksand-light': require('../assets/fonts/Quicksand_Light.otf'),
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
            source={require('../images/fondo4.png')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Image source={require('../images/welcome2.png')} style={styles.image} />
                <Text style={styles.titleWelcome}>ToDoWi</Text>
                <Text style={styles.parrafoWelcome}>"Organiza tu día, cumple tus metas. ToDoWi, tu aliado en la productividad."</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.welcomeButton}>
                    <Text style={styles.buttonText}>Ingresar</Text>
                </TouchableOpacity>
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
    titleWelcome: {
        fontFamily: 'poppins-bold',
        textShadowColor: '#98A7F8',
        textShadowOffset: { width: 2, height: 4 },
        textShadowRadius: 1,
        fontSize: 70,
        marginTop: 30,
        marginBottom: 10,
        color: '#102D4B',
    },
    parrafoWelcome: {
        fontFamily: 'poppins-regular',
        paddingLeft: 25,
        paddingRight: 25,
        textAlign: 'center',
        fontSize: 18,
        marginTop: 10,
        marginBottom: 15,
    },
    welcomeButton: {
        backgroundColor: '#546DF8',
        padding: 15,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
        marginTop: 25,
    },
    buttonText: {
        fontFamily: 'poppins-regular',
        color: 'white',
        fontSize: 16,
    }
});

export default WelcomeScreen;
