import { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, TextInput, Platform,
  StatusBar, RefreshControl
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

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'premium', label: 'Premium' },
  { id: 'xl', label: 'XL' },
]

const getVehicleIcon = (make) => {
  const icons = {
    'Tesla': 'flash',
    'BMW': 'star',
    'Polestar': 'star-outline',
    'Rivian': 'car-sport',
  }
  return icons[make] || 'car-outline'
}

const getTypeColor = (type) => {
  const colors = {
    comfort: '#3b82f6',
    premium: GOLD,
    xl: '#8b5cf6',
  }
  return colors[type] || MUTED
}

export default function RentEVScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start()
    fetchVehicles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [vehicles, search, activeFilter])

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1]
  })

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_URL}/vehicles`)
      const data = await res.json()
      setVehicles(data)
    } catch (err) {
      console.log('Error fetching vehicles:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    let result = [...vehicles]
    if (search) {
      result = result.filter(v =>
        v.make?.toLowerCase().includes(search.toLowerCase()) ||
        v.model?.toLowerCase().includes(search.toLowerCase()) ||
        v.location?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (activeFilter !== 'all') {
      result = result.filter(v => v.type === activeFilter)
    }
    setFiltered(result)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchVehicles()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Rent an EV</Text>
          <Text style={styles.headerSub}>Toronto & GTA</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* HERO BANNER */}
      <View style={styles.heroBanner}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroTitle}>Drive Electric</Text>
          <Text style={styles.heroSub}>Zero emissions · Zero hassle</Text>
        </View>
        <View style={styles.heroIconWrap}>
          <Ionicons name="flash" size={32} color={GOLD} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
      >
        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={MUTED} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by make, model or area..."
              placeholderTextColor={MUTED}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={MUTED} />
              </TouchableOpacity>
            )}
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
              style={[styles.filterBtn, activeFilter === f.id && styles.filterBtnActive]}
              onPress={() => setActiveFilter(f.id)}
            >
              <Text style={[styles.filterBtnText, activeFilter === f.id && styles.filterBtnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* STATS */}
        {!loading && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{filtered.length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: GREEN }]}>100%</Text>
              <Text style={styles.statLabel}>Electric</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>GTA</Text>
              <Text style={styles.statLabel}>Coverage</Text>
            </View>
          </View>
        )}

        {/* VEHICLES LIST */}
        <View style={styles.listContainer}>
          {loading ? (
            [1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.skeletonCard, { opacity: skeletonOpacity }]} />
            ))
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={MUTED} />
              <Text style={styles.emptyTitle}>No vehicles found</Text>
              <Text style={styles.emptyDesc}>Try a different search or filter</Text>
            </View>
          ) : (
            filtered.map((vehicle, i) => (
              <View key={vehicle.id || i} style={styles.vehicleCard}>
                {/* TOP */}
                <View style={styles.vehicleTop}>
                  <View style={[styles.vehicleIconWrap, { backgroundColor: `${getTypeColor(vehicle.type)}22` }]}>
                    <Ionicons name={getVehicleIcon(vehicle.make)} size={28} color={getTypeColor(vehicle.type)} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
                    <Text style={styles.vehicleYear}>{vehicle.year} · {vehicle.color}</Text>
                    <View style={styles.vehicleBadgeRow}>
                      <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor(vehicle.type)}22` }]}>
                        <Text style={[styles.typeBadgeText, { color: getTypeColor(vehicle.type) }]}>
                          {vehicle.type}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.priceWrap}>
                    <Text style={styles.priceAmount}>${vehicle.daily_rate}</Text>
                    <Text style={styles.priceLabel}>/day</Text>
                  </View>
                </View>

                {/* DETAILS */}
                <View style={styles.vehicleDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color={MUTED} />
                    <Text style={styles.detailText}>{vehicle.location}</Text>
                  </View>
                  {vehicle.range_miles && (
                    <View style={styles.detailItem}>
                      <Ionicons name="flash-outline" size={14} color={GREEN} />
                      <Text style={styles.detailText}>{vehicle.range_miles} mi range</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={GOLD} />
                    <Text style={styles.detailText}>Verified</Text>
                  </View>
                </View>

                {/* FOOTER */}
                <View style={styles.vehicleFooter}>
                  <View style={styles.ratingWrap}>
                    <Ionicons name="star" size={14} color={GOLD} />
                    <Text style={styles.ratingText}>4.9</Text>
                    <Text style={styles.ratingCount}>(24 trips)</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => {}}
                  >
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* INFO BANNER */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color={GOLD} />
          <Text style={styles.infoText}>
            All vehicles are inspected and insured. Pull to refresh for latest availability.
          </Text>
        </View>

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
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  headerSub: { fontSize: 12, color: MUTED, marginTop: 2 },

  heroBanner: {
    backgroundColor: DARK, margin: 16, borderRadius: 16,
    padding: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  heroLeft: {},
  heroTitle: { fontSize: 20, fontWeight: '800', color: CARD, marginBottom: 4 },
  heroSub: { fontSize: 13, color: MUTED },
  heroIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(232,196,104,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  searchWrap: { paddingHorizontal: 16, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: BORDER,
  },
  searchInput: { flex: 1, fontSize: 15, color: DARK },

  filtersRow: { marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER,
  },
  filterBtnActive: { backgroundColor: DARK, borderColor: DARK },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: DARK },
  filterBtnTextActive: { color: GOLD },

  statsRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  statNum: { fontSize: 20, fontWeight: '700', color: DARK },
  statLabel: { fontSize: 11, color: MUTED, marginTop: 2 },

  listContainer: { paddingHorizontal: 16, gap: 12 },

  vehicleCard: {
    backgroundColor: CARD, borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  vehicleTop: { flexDirection: 'row', marginBottom: 12 },
  vehicleIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '700', color: DARK },
  vehicleYear: { fontSize: 13, color: MUTED, marginTop: 2 },
  vehicleBadgeRow: { flexDirection: 'row', marginTop: 6 },
  typeBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  priceWrap: { alignItems: 'flex-end' },
  priceAmount: { fontSize: 22, fontWeight: '700', color: DARK },
  priceLabel: { fontSize: 12, color: MUTED },

  vehicleDetails: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, marginBottom: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: MUTED },

  vehicleFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER,
  },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: DARK },
  ratingCount: { fontSize: 12, color: MUTED },
  bookBtn: {
    backgroundColor: GOLD, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  bookBtnText: { fontSize: 14, fontWeight: '700', color: DARK },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, margin: 16,
    backgroundColor: '#FFF8E7', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#F0E4B8',
  },
  infoText: { flex: 1, fontSize: 13, color: DARK, lineHeight: 20 },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: MUTED, textAlign: 'center' },

  skeletonCard: {
    height: 180, backgroundColor: '#E8E8E8',
    borderRadius: 16, marginBottom: 12,
  },
})

