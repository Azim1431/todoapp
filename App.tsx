import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyD3AK7VuteWYAyVk32vqOO4UgFBnD79_y4",
  authDomain: "reactnativetodoapp-c2858.firebaseapp.com",
  projectId: "reactnativetodoapp-c2858",
  storageBucket: "reactnativetodoapp-c2858.firebasestorage.app",
  messagingSenderId: "99547055057",
  appId: "1:99547055057:web:c456ee85303989525796f0",
  measurementId: "G-L3KZC6Y2WM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// init firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
}

export default function App() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(u => {
      setUser(u);
    });
    loadTasks();
    return unsubscribe;
  }, []);

  const loadTasks = async () => {
    const stored = await AsyncStorage.getItem('tasks');
    if (stored) setTasks(JSON.parse(stored));
  };

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      deadline,
      completed: false,
    };
    const updated = [...tasks, newTask];
    saveTasks(updated);
    setTitle('');
    setDescription('');
    setDeadline('');
  };

  const toggleComplete = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const register = () => {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .catch(err => alert(err.message));
  };

  const login = () => {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(err => alert(err.message));
  };

  const logout = () => firebase.auth().signOut();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>To-Do Login / Register</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.btn} onPress={login}><Text style={styles.btnText}>Login</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={register}><Text style={styles.btnText}>Register</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My To-Do List</Text>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Deadline (YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} />
        <TouchableOpacity style={styles.btn} onPress={addTask}><Text style={styles.btnText}>Add Task</Text></TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.task, item.completed && { backgroundColor: '#c8e6c9' }]}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>Deadline: {item.deadline}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => toggleComplete(item.id)}><Text style={styles.link}>✔️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}><Text style={styles.link}>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f1f8ff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  btn: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 5 },
  btnOutline: { borderColor: '#007bff', backgroundColor: '#a4cd1eff', borderWidth: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  form: { marginBottom: 20 },
  task: { backgroundColor: 'white', padding: 10, borderRadius: 8, marginBottom: 10 },
  taskTitle: { fontSize: 16, fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  link: { fontSize: 18 },
  logout: { backgroundColor: '#ff4d4d', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 15 },
});
