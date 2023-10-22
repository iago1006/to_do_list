import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import axios from 'axios';
import { getAuthToken } from '../auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const TaskListScreen = ({ route }) => {
  const { listId, listName } = route.params;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Función para obtener las tareas de la lista
  const fetchTasks = async () => {
    const authToken = await getAuthToken();
    if (authToken) {
      try {
        const response = await axios.get(`http://192.168.0.14:3000/lists/${listId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setTasks(response.data.tasks);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
        setLoading(false);
      }
    } else {
      console.error('Token de autenticación no encontrado.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []); // Ejecutar la función cuando se monta la pantalla

  return (
    <ImageBackground
      source={require('../images/background.jpg')}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('MainScreen')}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{listName}</Text>
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.task_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.taskContainer}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text>{item.description}</Text>
                <Text>{item.due_date}</Text>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
  taskContainer: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TaskListScreen;
