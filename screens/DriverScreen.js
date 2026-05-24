import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Switch } from 'react-native'

const API_URL = 'http://10.0.0.100:3000'

export default function DriverScreen() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [accepting, setAccepting] = useState(null)

  const driverId = '4e1eafb8-fca0-44ec-b3e1-1c63f002c0de'

  useEffect(() => {
    if (isOnline) fetchAvailableRides()
  }, [isOnline])

  const fetchAvailableRides = () => {
    setLoading(true)
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
  }

  const acceptRide = async (rideId) => {
    setAccepting(rideId)
    try {
      const response = await fetch(`${API_URL}/rides/${rideId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      })
      const data = await response.json()
      console.log('Ride accepted:', data)
      fetchAvailableRides()
    } catch (err) {
      console.log('Error:', err)
    }
    setAccepting(null)
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View>
          <Text style={styles.statusLabel}>Driver Status</Text>
          <Text style={[styles.statusValue, { color: isOnline ? '#00ff88' : '#666' }]}>
            {isOnline ? '🟢 Online' : '⚫ Offline'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          trackColor={{ false: '#333', true: '#00ff8844' }}
          thumbColor={isOnline ? '#00ff88' : '#666'}
        />
      </View>

      {!isOnline ? (
        <View style={styles.offline}>
          <Text style={styles.offlineText}>Go online to see ride requests</Text>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#00ff88" style={styles.loader} />
      ) : rides.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No rides available</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchAvailableRides}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.route}>
                <Text style={styles.pickup}>📍 {item.pickup}</Text>
                <Text style={styles.dropoff}>🏁 {item.dropoff}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>
                  ${(item.base_price * item.surge_multiplier).toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptRide(item.id)}
                  disabled={accepting === item.id}
                >
                  {accepting === item.id ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={styles.acceptText}>Accept</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 20 },
  statusLabel: { color: '#666', fontSize: 13 },
  statusValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  offline: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  offlineText: { color: '#666', fontSize: 16 },
  loader: { marginTop: 40 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#666', fontSize: 16, marginBottom: 16 },
  refreshButton: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  refreshText: { color: '#00ff88' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  route: { marginBottom: 12 },
  pickup: { color: '#ffffff', fontSize: 15, marginBottom: 4 },
  dropoff: { color: '#aaa', fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#00ff88', fontSize: 22, fontWeight: 'bold' },
  acceptButton: { backgroundColor: '#00ff88', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  acceptText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
})

