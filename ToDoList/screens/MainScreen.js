import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { removeAuthToken, getAuthToken } from '../auth';
import axios from 'axios';

const MainScreen = ({ navigation }) => {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskLists = async () => {
      const authToken = await getAuthToken();

      if (!authToken) {
        navigation.navigate('Login');
        return;
      }

      const apiUrl = 'http://192.168.0.14:3000/lists';

      try {
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        setTaskLists(response.data);
      } catch (error) {
        console.error('Error al obtener las listas de tareas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskLists();
  }, [navigation]);

  const handleLogout = async () => {
    await removeAuthToken();
    navigation.navigate('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }  

  return (
    <ImageBackground
      source={require('../images/background.jpg')}
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
        keyExtractor={(item) => item.list_id.toString()}
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
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainScreen;
