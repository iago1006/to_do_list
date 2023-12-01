import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, ImageBackground, TextInput, Modal } from 'react-native';
import axios from 'axios';
import { getAuthToken, API_URL } from '../auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';



const TaskListScreen = ({ route }) => {
  const { listId, listName } = route.params;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  /*const [date, setDate] = useState(new Date());*/
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Inicializa el estado date con la fecha actual sin la hora
  const [date, setDate] = useState(today);
  const [show, setShow] = useState(false);
  const navigation = useNavigation();
  //Cambio Realizado
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };
  //Cambio Realizado
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
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
    if (date.getTime() < today.getTime()) {
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
        taskTime: time.toISOString().split('T')[1].substring(0, 5), // Esto añadirá la hora en formato HH:MM
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

        // Solicita permisos para enviar notificaciones
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('No se concedió el permiso para enviar notificaciones');
          return;
        }

        // Crea un objeto Date para la fecha y hora de vencimiento de la tarea
        const dueDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours() - 5, time.getMinutes());

        // Programa una notificación para la fecha y hora de vencimiento de la tarea
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: newTaskTitle,
            body: newTaskDescription,
          },
          trigger: dueDateTime,
        });

        // Imprime el identificador de la notificación en la consola
        console.log('Identificador de la notificación:', notificationId);

        // Imprime la fecha y hora de vencimiento en la consola
        console.log('Fecha y hora de vencimiento:', dueDateTime);

      }
    } catch (error) {
      console.error('Error al crear la tarea:', error);
    }


  };

  const handleDeleteTask = async (taskId) => {
    // Guarda la tarea que se va a eliminar
    const task = tasks.find((task) => task.task_id === taskId);
    setTaskToDelete(task);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTask = async () => {
    // Oculta el modal de confirmación
    setShowDeleteConfirmation(false);

    if (taskToDelete) {
      // Realiza la eliminación de la tarea
      try {
        const authToken = await getAuthToken();
        if (!authToken) {
          navigation.navigate('Login');
          return;
        }

        const response = await axios.delete(
          `${API_URL}/lists/${listId}/tasks/${taskToDelete.task_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.status === 200) {
          // Eliminar la tarea del estado "tasks"
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.task_id !== taskToDelete.task_id)
          );
        }
      } catch (error) {
        console.error('Error al eliminar la tarea:', error);
      }
    }

    // Restablece el estado de la tarea a eliminar
    setTaskToDelete(null);
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
      source={require('../images/fondo3.png')}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('MainScreen')}>
            <Icon name="arrow-left" size={20} color="white" />
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
                  <Text style={styles.taskDueTime}>
                    {item.task_time && item.task_time.includes(':')
                      ? new Date('1970-01-01T' + item.task_time.toString() + 'Z').toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : item.task_time
                    }
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
        {/*  */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 70,
            height: 70,
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: '#301adb',
            borderRadius: 100,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={handleAddTask}
        >
          <Icon name="plus" size={18} color="white" />
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

              <Text style={styles.inputLabel}>Hora</Text>
              <View style={{ ...styles.inputRow, justifyContent: 'space-between' }}>
                <TextInput
                  style={styles.timeInput}
                  value={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} // Esto mostrará la hora en formato HH:MM en la zona horaria local
                  editable={false} // Esto hace que el TextInput no sea editable
                  placeholder=" -- : -- " // Esto mostrará una línea cuando no se haya seleccionado una hora
                />

                <TouchableOpacity
                  style={styles.datePickerButton} // Usa el mismo estilo que el botón del selector de fecha
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text>Seleccionar hora</Text>
                </TouchableOpacity>
              </View>
              {showTimePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={time}
                  mode={'time'}
                  display="default"
                  onChange={onChangeTime}
                  is24Hour={true} // Esto mostrará el selector de tiempo en formato de 24 horas
                />
              )}



              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddTaskModal(false);
                    setNewTaskTitle('');
                    setNewTaskDescription('');
                  }}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateTask}
                >
                  <Text style={styles.buttonText}>Crear Tarea</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


        <Modal
          visible={showDeleteConfirmation}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
              <Text style={styles.modalDescription}>¿Está seguro de que desea eliminar esta tarea?</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteConfirmation(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteDeleteButton}
                  onPress={confirmDeleteTask}
                >
                  <Text style={styles.buttonText}>Eliminar</Text>
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
    backgroundColor: '#3038d2',
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
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 12,
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
  // Agrega estos estilos al objeto de estilos
  deleteDeleteButton: {
    marginTop: 10,
    backgroundColor: '#ff0000',
    padding: 12,
    borderRadius: 5,
    width: '45%',
  },
  addButton: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#3e4bed',
    alignItems: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'medium',
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
  taskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
    color: '#301adb',
  },
  taskDescription: {
    marginTop: 5,
    marginBottom: 8,
    marginRight: 9,
    textAlign: 'justify',
    fontStyle: 'italic',
    fontSize: 16,
  },
  taskDueDate: {
    color: '#555',
    marginTop: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  taskDueTime: {
    color: 'black',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
    color: '#301adb',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completeButton: {
    marginLeft: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#546DF8',
    borderRadius: 4,
    width: 40,
    height: 40,
    backgroundColor: '#546DF8',
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
  modalDescription: {
    fontSize: 18,
    textAlign: 'justify',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#301adb',
    padding: 12,
    borderRadius: 5,
    width: '45%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  createButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 5,
    width: '45%',
  },
});

export default TaskListScreen;
