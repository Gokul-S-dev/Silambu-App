import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddContact = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Name and phone number are required.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/v1/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone_number: phone, relation })
      });
      
      if (res.ok) {
        setName('');
        setPhone('');
        setRelation('');
        fetchContacts();
      } else {
        Alert.alert('Error', 'Failed to add contact.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteContact = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchContacts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Contact Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Relation (e.g. Mother, Friend)"
          placeholderTextColor="#888"
          value={relation}
          onChangeText={setRelation}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View>
              <Text style={styles.contactName}>{item.name} {item.relation ? `(${item.relation})` : ''}</Text>
              <Text style={styles.contactPhone}>{item.phone_number}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteContact(item.id)}>
              <SymbolView name="trash" size={24} tintColor="#ff3b30" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactPhone: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
  },
});
