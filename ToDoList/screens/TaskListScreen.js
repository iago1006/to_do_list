import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, ImageBackground, TextInput, Modal } from 'react-native';
import axios from 'axios';
import { getAuthToken, API_URL } from '../auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';


const TaskListScreen = ({ route }) => {
  const { listId, listName } = route.params;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  /*const [newTaskDueDate, setNewTaskDueDate] = useState('');*/ //Cambio Realizado
  const [date, setDate] = useState(new Date()); // Nuevo estado para la fecha
  const [show, setShow] = useState(false); // Nuevo estado para mostrar/ocultar el selector de fecha
  const navigation = useNavigation();

  //Cambio Realizado
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };
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
    if (!newTaskTitle.trim() || !newTaskDescription.trim()) {
      alert('Los campos no pueden estar vacíos');
      return;
    }
    //Comprueba si la fecha seleccionada es anterior a la fecha actual
    if(date < new Date()){
      alert('La fecha de vencimiento no puede ser anterior a la fecha actual');
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
        /*dueDate: newTaskDueDate,*/ //Cambio Realizado
        dueDate: date.toISOString().split('T')[0],
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

  const handleCompleteTask = async (taskId, isCompleted) => {
    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        navigation.navigate('Login');
        return;
      }

      const updateTaskData = {
        completed: isCompleted,
      };

      const response = await axios.patch(
        `${API_URL}/lists/${listId}/tasks/${taskId}`,
        updateTaskData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Actualizar la tarea como completada en el estado "tasks"
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === taskId ? { ...task, completed: isCompleted } : task
          )
        );
      }
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../images/fondomessi3.jpg')}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('MainScreen')}>
            <Icon name="arrow-left" size={24} color="white" />
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
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDescription}>{item.description}</Text>
                  <Text style={styles.taskDueDate}>
                    {new Date(item.due_date).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      item.completed && styles.completedButton,
                    ]}
                    onPress={() => handleCompleteTask(item.task_id, !item.completed)}
                  >
                    {item.completed ? (
                      <Icon name="check" size={24} color="white" />
                    ) : null}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTask(item.task_id)}
                  >
                    <Icon name="trash" size={24} color="white" />
                  </TouchableOpacity>
                </View>
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
        {/* Modal de Agregar Tarea */}
        <Modal
          visible={showAddTaskModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Agregar Tarea</Text>

              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Título de la tarea"
                value={newTaskTitle}
                onChangeText={(text) => setNewTaskTitle(text)}
              />

              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={styles.input}
                placeholder="Descripción de la tarea"
                value={newTaskDescription}
                onChangeText={(text) => setNewTaskDescription(text)}
              />
              {/* Cambio Realizado */}
              <Text style={styles.inputLabel}>Fecha de vencimiento</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.dateInput}
                  value={date.toISOString().split('T')[0]}
                  editable={false} // Esto hace que el TextInput no sea editable
                />
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShow(true)}
                >
                  <Text>Seleccionar fecha</Text>
                </TouchableOpacity>
              </View>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={'date'}
                  display="default"
                  onChange={onChange}
                />
              )}
              {/*<Text style={styles.inputLabel}>Fecha de vencimiento</Text>
              <TouchableOpacity onPress={() => setShow(true)}>
                <Text>{date.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={'date'}
                  display="default"
                  onChange={onChange}
                />
              )}*/}

              {/*<Text style={styles.inputLabel}>Fecha</Text>
              <TextInput
                style={styles.input}
                placeholder="Fecha de vencimiento (YYYY-MM-DD)"
                value={newTaskDueDate}
                onChangeText={(text) => setNewTaskDueDate(text)}
              />*/}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddTaskModal(false);
                    setNewTaskTitle('');
                    setNewTaskDescription('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateTask}
                >
                  <Text style={styles.createButtonText}>Crear Tarea</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F9A11B',
    padding: 20,
    borderRadius: 4,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 16,
    color: 'white'
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Alinea los elementos a la derecha
    alignItems: 'center',
    padding: 16,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#ECE9E9',
    borderRadius: 5,
  },
  taskInfo: {
    flex: 1, // Ocupa todo el espacio restante
  },
  taskButtons: {
    flexDirection: 'row', // Botones en la misma fila
  },
  deleteButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff0000',
    borderRadius: 5,
  },
  addButton: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F9A11B',
    alignItems: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'black',
    fontSize: 20,
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
    marginTop: 5,
    marginBottom: 15,
  },
  inputLabel: {
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ECE9E9',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginTop: 5,
    marginBottom: 5,
  },
  taskDescription: {
    marginTop: 5,
    marginBottom: 8,
    marginRight: 9,
    textAlign: 'justify',
    fontSize: 16,
  },
  taskDueDate: {
    color: '#555',
    marginTop: 5,
    marginBottom: 5,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
  completeButton: {
    marginLeft: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F9A11B',
    borderRadius: 4,
    width: 40,
    height: 40,
    backgroundColor: '#F9A11B',
  },
  completeButtonText: {
    color: '#fff',
  },
  
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#ECE9E9',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
  },
  datePickerButton: {
    padding: 7,
    backgroundColor: 'white',
    borderRadius: 3,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: 'rgba(251,0,0,0.63)',
    padding: 12,
    borderRadius: 5,
    width: '45%',
  },
  cancelButtonText: {
    color: 'white',
    textAlign:'center',
  },
  createButton: {
    marginTop: 10,
    backgroundColor: '#F9A11B',
    padding: 12,
    borderRadius: 5,
    width:'45%',
  },
  createButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default TaskListScreen;
