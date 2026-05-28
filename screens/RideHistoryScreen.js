import { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, Platform, StatusBar,
  Linking, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const GREEN = '#22c55e'
const RED = '#ef4444'
const API_URL = 'http://10.0.0.100:3000'

const getStatusColor = (status) => {
  const colors = {
    completed: GREEN,
    cancelled: RED,
    searching: GOLD,
    in_progress: GOLD,
    scheduled: '#3b82f6',
  }
  return colors[status] || MUTED
}

const getStatusLabel = (status) => {
  const labels = {
    completed: 'Completed',
    cancelled: 'Cancelled',
    searching: 'Searching',
    in_progress: 'In Progress',
    scheduled: 'Scheduled',
  }
  return labels[status] || status
}

export default function RideHistoryScreen({ navigation }) {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
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

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1]
  })

  const fetchRides = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch(`${API_URL}/rides`)
      const data = await res.json()
      const userRides = data.filter(r => r.rider_id === user?.id)
      setRides(userRides.reverse())
    } catch (err) {
      console.log('Error fetching rides:', err)
    } finally {
      setLoading(false)
    }
  }

  const contactSupport = (ride) => {
    Alert.alert(
      'Contact Support',
      `What would you like to do about ride #${ride.id}?`,
      [
        {
          text: 'Email Support',
          onPress: () => Linking.openURL(`mailto:support@voltride.ca?subject=Ride%20Issue%20%23${ride.id}&body=Hi%2C%20I%20have%20an%20issue%20with%20ride%20%23${ride.id}.`)
        },
        {
          text: 'Call Support',
          onPress: () => Linking.openURL('tel:+14165550100')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const filteredRides = rides.filter(r => {
    if (filter === 'all') return true
    if (filter === 'completed') return r.status === 'completed'
    if (filter === 'cancelled') return r.status === 'cancelled'
    if (filter === 'scheduled') return r.status === 'scheduled'
    return true
  })

  const totalSpent = rides
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.base_price * r.surge_multiplier || 0), 0)

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="car-outline" size={20} color={GOLD} style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{rides.length}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={GREEN} style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{rides.filter(r => r.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={20} color={GOLD} style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterBtn, filter === f.id && styles.filterBtnActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterBtnText, filter === f.id && styles.filterBtnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RIDES LIST */}
        <View style={styles.listContainer}>
          {loading ? (
            [1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.skeletonCard, { opacity: skeletonOpacity }]} />
            ))
          ) : filteredRides.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="car-outline" size={36} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>No rides found</Text>
              <Text style={styles.emptyDesc}>
                {filter === 'all' ? "You haven't taken any rides yet." : `No ${filter} rides found.`}
              </Text>
              {filter === 'all' && (
                <TouchableOpacity
                  style={styles.bookRideBtn}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.bookRideBtnText}>Book your first ride</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredRides.map((ride, i) => (
              <View key={ride.id || i} style={styles.rideCard}>
                {/* TOP ROW */}
                <View style={styles.rideTop}>
                  <View style={[styles.rideIconWrap, { backgroundColor: `${getStatusColor(ride.status)}18` }]}>
                    <Ionicons
                      name={ride.status === 'completed' ? 'checkmark-circle' : ride.status === 'cancelled' ? 'close-circle' : 'time'}
                      size={22}
                      color={getStatusColor(ride.status)}
                    />
                  </View>
                  <View style={styles.rideInfo}>
                    <Text style={styles.rideRoute} numberOfLines={1}>
                      {ride.pickup} → {ride.dropoff}
                    </Text>
                    <Text style={styles.rideDate}>
                      {new Date(ride.created_at).toLocaleDateString('en-CA', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ride.status)}18` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                      {getStatusLabel(ride.status)}
                    </Text>
                  </View>
                </View>

                {/* DETAILS */}
                <View style={styles.rideDetails}>
                  <View style={styles.rideDetailItem}>
                    <Ionicons name="car-outline" size={14} color={MUTED} />
                    <Text style={styles.rideDetailText}>{ride.vehicle_type || 'Comfort'}</Text>
                  </View>
                  <View style={styles.rideDetailItem}>
                    <Ionicons name="wallet-outline" size={14} color={MUTED} />
                    <Text style={styles.rideDetailText}>
                      ${((ride.base_price || 0) * (ride.surge_multiplier || 1)).toFixed(2)}
                    </Text>
                  </View>
                  {ride.surge_multiplier > 1 && (
                    <View style={styles.rideDetailItem}>
                      <Ionicons name="trending-up-outline" size={14} color={RED} />
                      <Text style={[styles.rideDetailText, { color: RED }]}>
                        {ride.surge_multiplier}x surge
                      </Text>
                    </View>
                  )}
                </View>

                {/* FOOTER */}
                <View style={styles.rideFooter}>
                  {ride.status === 'completed' && (
                    <TouchableOpacity style={styles.rateBtn}>
                      <Ionicons name="star-outline" size={14} color={GOLD} />
                      <Text style={styles.rateBtnText}>Rate ride</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.supportBtn}
                    onPress={() => contactSupport(ride)}
                  >
                    <Ionicons name="help-circle-outline" size={14} color={DARK} />
                    <Text style={styles.supportBtnText}>Get help</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* SUPPORT BANNER */}
        <TouchableOpacity
          style={styles.supportBanner}
          onPress={() => Linking.openURL('mailto:support@voltride.ca')}
        >
          <View style={styles.supportBannerLeft}>
            <Ionicons name="headset-outline" size={22} color={GOLD} />
            <View>
              <Text style={styles.supportBannerTitle}>Need help with a ride?</Text>
              <Text style={styles.supportBannerSub}>Our support team is available 24/7</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#FAEDCB',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },

  statsRow: {
    flexDirection: 'row', gap: 10,
    padding: 16, paddingBottom: 8,
  },
  statCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 14,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: DARK },
  statLabel: { fontSize: 11, color: MUTED, marginTop: 2 },

  filtersRow: { marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER,
  },
  filterBtnActive: { backgroundColor: DARK, borderColor: DARK },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: DARK },
  filterBtnTextActive: { color: GOLD },

  listContainer: { padding: 16, gap: 12 },

  rideCard: {
    backgroundColor: CARD, borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  rideTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rideIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  rideInfo: { flex: 1 },
  rideRoute: { fontSize: 14, fontWeight: '600', color: DARK },
  rideDate: { fontSize: 12, color: MUTED, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: '600' },

  rideDetails: {
    flexDirection: 'row', gap: 16,
    paddingTop: 10, paddingBottom: 10,
    borderTopWidth: 1, borderTopColor: BORDER,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    marginBottom: 10,
  },
  rideDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rideDetailText: { fontSize: 12, color: MUTED },

  rideFooter: { flexDirection: 'row', gap: 8 },
  rateBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, backgroundColor: '#FFF8E7',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#F0E4B8',
  },
  rateBtnText: { fontSize: 12, fontWeight: '600', color: GOLD },
  supportBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, backgroundColor: '#F5F5F5',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  supportBtnText: { fontSize: 12, fontWeight: '600', color: DARK },

  supportBanner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD, marginHorizontal: 16,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    borderWidth: 1, borderColor: BORDER,
  },
  supportBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  supportBannerTitle: { fontSize: 14, fontWeight: '700', color: DARK },
  supportBannerSub: { fontSize: 12, color: MUTED, marginTop: 2 },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 20 },
  bookRideBtn: {
    backgroundColor: GOLD, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  bookRideBtnText: { fontSize: 14, fontWeight: '700', color: DARK },

  skeletonCard: {
    height: 140, backgroundColor: '#E8E8E8',
    borderRadius: 16,
  },
})

