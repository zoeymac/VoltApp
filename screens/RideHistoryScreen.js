import { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const GREEN = '#22c55e'

const API_URL = 'http://10.0.0.100:3000'

export default function RideHistoryScreen({ navigation }) {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start()
    fetchRides()
  }, [])

  const fetchRides = async () => {
    try {
      const res = await fetch(`${API_URL}/rides`)
      const data = await res.json()
      setRides(data)
    } catch (err) {
      console.log('Error fetching rides:', err)
    } finally {
      setLoading(false)
    }
  }

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1]
  })

  const totalSpent = rides.reduce((sum, r) => sum + (r.base_price * r.surge_multiplier || 0), 0)
  const totalRides = rides.length
  const carbonSaved = (totalRides * 2.5).toFixed(1)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return GREEN
      case 'cancelled': return '#ef4444'
      case 'in_progress': return GOLD
      default: return MUTED
    }
  }

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'premium': return 'star-outline'
      case 'xl': return 'bus-outline'
      case 'accessible': return 'accessibility-outline'
      default: return 'car-outline'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-CA', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="flash-outline" size={20} color={GOLD} />
            </View>
            <Text style={styles.statValue}>{totalRides}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="wallet-outline" size={20} color={GOLD} />
            </View>
            <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={[styles.statCard, { borderColor: GREEN }]}>
            <View style={[styles.statIcon, { backgroundColor: '#F0FFF4' }]}>
              <Ionicons name="leaf-outline" size={20} color={GREEN} />
            </View>
            <Text style={[styles.statValue, { color: GREEN }]}>{carbonSaved} kg</Text>
            <Text style={styles.statLabel}>CO₂ Saved</Text>
          </View>
        </View>

        {/* RIDES LIST */}
        <Text style={styles.sectionTitle}>Recent Rides</Text>

        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.skeletonCard, { opacity: skeletonOpacity }]} />
            ))}
          </>
        ) : rides.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={MUTED} />
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptyDesc}>Your ride history will appear here</Text>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.bookBtnText}>Book a ride</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rides.map((ride, i) => (
            <View key={ride.id || i} style={styles.rideCard}>
              {/* TOP ROW */}
              <View style={styles.rideCardTop}>
                <View style={styles.rideIconWrap}>
                  <Ionicons
                    name={getVehicleIcon(ride.vehicle_type)}
                    size={22}
                    color={GOLD}
                  />
                </View>
                <View style={styles.rideCardMeta}>
                  <Text style={styles.rideDate}>{formatDate(ride.created_at)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ride.status)}22` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                      {ride.status?.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ridePrice}>
                  ${(ride.base_price * ride.surge_multiplier).toFixed(2)}
                </Text>
              </View>

              {/* ROUTE */}
              <View style={styles.routeWrap}>
                <View style={styles.routeRow}>
                  <View style={styles.dotGold} />
                  <Text style={styles.routeText} numberOfLines={1}>{ride.pickup}</Text>
                </View>
                <View style={{ paddingLeft: 5, marginVertical: 2 }}>
                  <View style={styles.routeLine} />
                </View>
                <View style={styles.routeRow}>
                  <View style={styles.dotDark} />
                  <Text style={styles.routeText} numberOfLines={1}>{ride.dropoff}</Text>
                </View>
              </View>

              {/* FOOTER */}
              <View style={styles.rideCardFooter}>
                <Text style={styles.rideFooterText}>
                  🌱 {(2.5).toFixed(1)} kg CO₂ saved
                </Text>
                {ride.driver_id && (
                  <TouchableOpacity style={styles.rateBtn}>
                    <Text style={styles.rateBtnText}>Rate ride</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FAEDCB',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },

  // STATS
  statsRow: {
    flexDirection: 'row',
    gap: 10, padding: 16,
  },
  statCard: {
    flex: 1, backgroundColor: CARD,
    borderRadius: 14, padding: 14,
    alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: DARK },
  statLabel: { fontSize: 11, color: MUTED, marginTop: 2 },

  // SECTION
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: DARK, paddingHorizontal: 16,
    marginBottom: 10,
  },

  // RIDE CARD
  rideCard: {
    backgroundColor: CARD, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 12,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  rideCardTop: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12,
  },
  rideIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  rideCardMeta: { flex: 1 },
  rideDate: { fontSize: 13, color: MUTED },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20, paddingHorizontal: 8,
    paddingVertical: 2, marginTop: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  ridePrice: { fontSize: 18, fontWeight: '700', color: DARK },

  // ROUTE
  routeWrap: {
    backgroundColor: '#FAFAFA', borderRadius: 10,
    padding: 12, marginBottom: 12,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  dotGold: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD, marginRight: 10 },
  dotDark: { width: 10, height: 10, borderRadius: 5, backgroundColor: DARK, marginRight: 10 },
  routeLine: { width: 2, height: 14, backgroundColor: '#DDD' },
  routeText: { flex: 1, fontSize: 13, color: DARK },

  // FOOTER
  rideCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideFooterText: { fontSize: 12, color: GREEN },
  rateBtn: {
    backgroundColor: '#FFF8E7', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: GOLD,
  },
  rateBtnText: { fontSize: 12, color: GOLD, fontWeight: '600' },

  // EMPTY
  emptyState: {
    alignItems: 'center', padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: MUTED, marginBottom: 24, textAlign: 'center' },
  bookBtn: {
    backgroundColor: DARK, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  bookBtnText: { color: GOLD, fontWeight: '700', fontSize: 15 },

  // SKELETON
  skeletonCard: {
    height: 140, backgroundColor: '#E8E8E8',
    borderRadius: 14, marginHorizontal: 16, marginBottom: 12,
  },
})
