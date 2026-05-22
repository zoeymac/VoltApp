import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = 'http://10.0.0.132:3000'

export default function App() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/rides/available`)
      .then(res => res.json())
      .then(data => {
        setRides(data)
        setLoading(false)
      })
      .catch(err => {
        console.log('Error:', err)
        setLoading(false)
      })
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚡ Volt</Text>
      <Text style={styles.subheader}>Available Rides</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#00ff88" />
      ) : rides.length === 0 ? (
        <Text style={styles.empty}>No rides available</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.pickup}>📍 {item.pickup}</Text>
              <Text style={styles.dropoff}>🏁 {item.dropoff}</Text>
              <Text style={styles.price}>${item.base_price * item.surge_multiplier}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          )}
        />
      )}
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00ff88',
  },
  pickup: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 4,
  },
  dropoff: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 8,
  },
  price: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 16,
  },
})

