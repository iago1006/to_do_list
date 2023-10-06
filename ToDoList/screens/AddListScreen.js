import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { getAuthToken } from '../auth';

const AddListScreen = ({ navigation }) => {
  const [listName, setListName] = useState('');

  const handleCreateList = async () => {
    const authToken = await getAuthToken();

    if (!authToken) {
      // Manejar el caso en el que no se haya obtenido el token de autenticación.
      return;
    }

    const apiUrl = 'http://192.168.0.14:3000/lists';

    try {
      const response = await axios.post(
        apiUrl,
        { name: listName }, // Datos de la nueva lista
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Manejar la respuesta del servidor aquí, por ejemplo, actualizar la lista de tareas local.
      
      // Navegar de regreso a la pantalla principal o realizar otra acción de navegación.
      navigation.goBack();
    } catch (error) {
      console.error('Error al crear la lista de tareas:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre de la Lista:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setListName(text)}
        value={listName}
        placeholder="Ingrese el nombre de la lista"
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleCreateList}>
        <Text style={styles.saveButtonText}>Guardar Lista</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddListScreen;
