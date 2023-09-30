import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { removeAuthToken } from '../auth';

const MainScreen = ({ navigation }) => {
  const [taskLists, setTaskLists] = useState([]);

  useEffect(() => {
    // Simula la obtención de las listas de tareas del usuario desde tu API o base de datos.
    const fakeTaskLists = [
      { id: 1, name: 'Lista de Tareas 1' },
      { id: 2, name: 'Lista de Tareas 2' },
      { id: 3, name: 'Lista de Tareas 3' },
    ];
    setTaskLists(fakeTaskLists);
  }, []);

  const handleLogout = async () => {
    await removeAuthToken();
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('../images/background.jpg')} // Ruta de la imagen de fondo
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="sign-out" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Listas de Tareas</Text>
      </View>
      <FlatList
        data={taskLists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              navigation.navigate('TaskList', { listId: item.id });
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover', // Ajustar la imagen al tamaño de la pantalla
    justifyContent: 'center', // Centrar elementos verticalmente
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo blanco semi-transparente
    padding: 16,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  logoutButton: {
    padding: 8,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    borderRadius: 8,
  },
});

export default MainScreen;
