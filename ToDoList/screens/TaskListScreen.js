import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, ImageBackground, TextInput, Modal } from 'react-native';
import axios from 'axios';
import { getAuthToken, API_URL } from '../auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const TaskListScreen = ({ route }) => {
  const { listId, listName } = route.params;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const navigation = useNavigation();

  // Función para obtener las tareas de la lista
  const fetchTasks = async () => {
    const authToken = await getAuthToken();
    if (authToken) {
      try {
        const response = await axios.get(`${API_URL}/lists/${listId}`, {
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

  const handleAddTask = async () => {
    setShowAddTaskModal(true);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !newTaskDescription.trim() || !newTaskDueDate.trim()) {
      alert('Los campos no pueden estar vacíos');
      return;
    }

    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        navigation.navigate('Login');
        return;
      }

      const newTaskData = {
        title: newTaskTitle,
        description: newTaskDescription,
        dueDate: newTaskDueDate,
      };

      const response = await axios.post(`${API_URL}/lists/${listId}/tasks`, newTaskData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 201) {
        fetchTasks();
        setShowAddTaskModal(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
      }
    } catch (error) {
      console.error('Error al crear la tarea:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        navigation.navigate('Login');
        return;
      }

      const response = await axios.delete(`${API_URL}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        // Eliminar la tarea del estado "tasks"
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.task_id !== taskId)
        );
      }
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
    }
  };


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
                <Text>
                  {new Date(item.due_date).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTask(item.task_id)}
                >
                  <Icon name="trash" size={24} color="#ff0000" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTask}
        >
          <Text style={styles.addButtonText}>Agregar Tarea</Text>
        </TouchableOpacity>
        <Modal
          visible={showAddTaskModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Agregar Tarea</Text>
              <TextInput
                style={styles.input}
                placeholder="Título de la tarea"
                value={newTaskTitle}
                onChangeText={(text) => setNewTaskTitle(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción de la tarea"
                value={newTaskDescription}
                onChangeText={(text) => setNewTaskDescription(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Fecha de vencimiento (YYYY-MM-DD)"
                value={newTaskDueDate}
                onChangeText={(text) => setNewTaskDueDate(text)}
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTask}
              >
                <Text style={styles.createButtonText}>Crear Tarea</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddTaskModal(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setNewTaskDueDate('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  deleteButton: {
    padding: 16,
  },
  addButton: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#007aff',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default TaskListScreen;
