import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'

const API_URL = 'http://10.0.0.132:3000'

export default function RideScreen() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/rides`)
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#00ff88'
      case 'in_progress': return '#ffaa00'
      case 'searching': return '#0088ff'
      case 'cancelled': return '#ff4444'
      default: return '#666666'
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#00ff88" style={styles.loader} />
      ) : rides.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No rides yet</Text>
          <Text style={styles.emptySubtext}>Your trip history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={styles.route}>
                <Text style={styles.pickup}>📍 {item.pickup}</Text>
                <Text style={styles.dropoff}>🏁 {item.dropoff}</Text>
              </View>
              <Text style={styles.price}>
                ${(item.base_price * item.surge_multiplier).toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  emptySubtext: { color: '#666', marginTop: 8 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  date: { color: '#666', fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  route: { marginBottom: 12 },
  pickup: { color: '#ffffff', fontSize: 15, marginBottom: 4 },
  dropoff: { color: '#aaa', fontSize: 14 },
  price: { color: '#00ff88', fontSize: 20, fontWeight: 'bold' },
})

