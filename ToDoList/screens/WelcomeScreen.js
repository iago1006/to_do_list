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
        });
        setFontsLoad(true)
    }
    if (!fontsLoaded) {
        return (<View />);
    }
    return (
        <ImageBackground
            source={require('../images/fondo2.png')}
            style={styles.background}
        >
            <View style={styles.container}>
                <Image source={require('../images/welcome.png')} style={styles.image} />
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
        fontFamily: 'quicksand-bold',
        textShadowColor: '#202DA7',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 3,
        fontSize: 60,
        marginTop: 20,
        marginBottom: 10,
        color: '#102D4B',
    },
    parrafoWelcome: {
        paddingLeft: 40,
        paddingRight: 40,
        textAlign: 'center',
        fontSize: 18,
        marginTop: 12,
        marginBottom: 12,
    },
    welcomeButton: {
        backgroundColor: '#F9A11B',
        padding: 15,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 19,
    }
});

export default WelcomeScreen;
