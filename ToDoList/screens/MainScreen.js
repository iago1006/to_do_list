import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground, TextInput, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { removeAuthToken, getAuthToken, API_URL } from '../auth';
import axios from 'axios';

const MainScreen = ({ navigation }) => {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const fetchTaskLists = useCallback(async () => {
    const authToken = await getAuthToken();

    if (!authToken) {
      navigation.navigate('Login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/lists`, {
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
  }, [navigation]);

  useEffect(() => {
    fetchTaskLists();
  }, [fetchTaskLists]);

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

  const handleAddList = async () => {
    setShowAddListModal(true);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('El nombre de la lista no puede estar vacío');
      return;
    }

    if (taskLists.some(list => list.name === newListName)) {
      alert('Ya existe una lista con ese nombre');
      return;
    }

    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        navigation.navigate('Login');
        return;
      }

      const newListData = {
        name: newListName,
      };

      const response = await axios.post(`${API_URL}/lists`, newListData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 201) {
        fetchTaskLists();
        setShowAddListModal(false);
        setNewListName('');
      }
    } catch (error) {
      console.error('Error al crear la lista de tareas:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        navigation.navigate('Login');
        return;
      }

      const response = await axios.delete(`${API_URL}/lists/${listId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        // Eliminar la lista del estado taskLists
        setTaskLists((prevTaskLists) =>
          prevTaskLists.filter((list) => list.list_id !== listId)
        );
      }
    } catch (error) {
      console.error('Error al eliminar la lista de tareas:', error);
    }
  };


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
          <View style={styles.listItemContainer}>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                navigation.navigate('TaskList', { listId: item.list_id, listName: item.name });
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteList(item.list_id)}
            >
              <Icon name="trash" size={24} color="#ff0000" />
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddList}
      >
        <Text style={styles.addButtonText}>Agregar Lista</Text>
      </TouchableOpacity>
      <Modal
        visible={showAddListModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Lista</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la lista"
              value={newListName}
              onChangeText={(text) => setNewListName(text)}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateList}
            >
              <Text style={styles.createButtonText}>Crear Lista</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddListModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 16,
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
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItem: {
    flex: 1,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
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

export default MainScreen;