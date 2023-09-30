import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskListScreen = ({ route }) => {
  // Obtén el parámetro listId de la navegación
  const { listId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles de la Lista de Tareas</Text>
      <Text style={styles.listName}>List ID: {listId}</Text>
      {/* Agrega aquí más detalles de la lista de tareas si es necesario */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listName: {
    fontSize: 18,
  },
});

export default TaskListScreen;
