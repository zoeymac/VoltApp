import { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, TextInput, Platform,
  StatusBar, RefreshControl, Linking
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const GREEN = '#22c55e'
const RED = '#ef4444'

const GBFS_STATIONS = 'https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information'
const GBFS_STATUS = 'https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status'

export default function RentBikeScreen({ navigation }) {
  const [stations, setStations] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start()
    fetchStations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [stations, search, filter])

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1]
  })

  const fetchStations = async () => {
    try {
      const [stationRes, statusRes] = await Promise.all([
        fetch(GBFS_STATIONS),
        fetch(GBFS_STATUS),
      ])
      const stationData = await stationRes.json()
      const statusData = await statusRes.json()

      const statusMap = {}
      statusData.data.stations.forEach(s => {
        statusMap[s.station_id] = s
      })

      const merged = stationData.data.stations
        .map(s => ({
          ...s,
          ...statusMap[s.station_id],
        }))
        .filter(s => s.name)
        .slice(0, 80)

      setStations(merged)
      setLastUpdated(new Date())
    } catch (err) {
      console.log('Error fetching bike stations:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    let result = [...stations]
    if (search) {
      result = result.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (filter === 'available') {
      result = result.filter(s => s.num_bikes_available > 0)
    }
    if (filter === 'docks') {
      result = result.filter(s => s.num_docks_available > 0)
    }
    setFiltered(result)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchStations()
  }

  const getBikeColor = (num) => {
    if (num === 0) return RED
    if (num <= 3) return GOLD
    return GREEN
  }

  const openMaps = (station) => {
    Linking.openURL(`maps://maps.apple.com/?q=${station.name}&ll=${station.lat},${station.lon}`)
      .catch(() => Linking.openURL(`https://maps.google.com/?q=${station.lat},${station.lon}`))
  }

  const FILTERS = [
    { id: 'all', label: 'All Stations' },
    { id: 'available', label: 'Bikes Available' },
    { id: 'docks', label: 'Docks Available' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Rent a Bike</Text>
          <Text style={styles.headerSub}>Toronto Bike Share</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={20} color={DARK} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroBanner}>
        <View>
          <Text style={styles.heroTitle}>Bike Share Toronto</Text>
          <Text style={styles.heroSub}>Real-time · {filtered.length} stations</Text>
          {lastUpdated && (
            <Text style={styles.heroUpdated}>
              Updated {lastUpdated.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        <View style={styles.heroIconWrap}>
          <Ionicons name="bicycle" size={32} color={GOLD} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
      >
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={MUTED} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stations..."
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

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
            <Text style={styles.legendText}>4+ bikes</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: GOLD }]} />
            <Text style={styles.legendText}>1-3 bikes</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: RED }]} />
            <Text style={styles.legendText}>No bikes</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <Animated.View key={i} style={[styles.skeletonCard, { opacity: skeletonOpacity }]} />
            ))
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={48} color={MUTED} />
              <Text style={styles.emptyTitle}>No stations found</Text>
              <Text style={styles.emptyDesc}>Try a different search or filter</Text>
            </View>
          ) : (
            filtered.map((station, i) => (
              <View key={station.station_id || i} style={styles.stationCard}>
                <View style={styles.stationTop}>
                  <View style={[styles.stationIconWrap, { backgroundColor: `${getBikeColor(station.num_bikes_available)}18` }]}>
                    <Ionicons name="bicycle" size={22} color={getBikeColor(station.num_bikes_available)} />
                  </View>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName} numberOfLines={2}>{station.name}</Text>
                    <Text style={styles.stationAddress} numberOfLines={1}>
                      {station.address || 'Toronto, ON'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.mapBtn} onPress={() => openMaps(station)}>
                    <Ionicons name="navigate-outline" size={18} color={GOLD} />
                  </TouchableOpacity>
                </View>

                <View style={styles.stationStats}>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: getBikeColor(station.num_bikes_available) }]} />
                    <Text style={styles.statNum}>{station.num_bikes_available ?? '—'}</Text>
                    <Text style={styles.statLabel}>Bikes</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: station.num_docks_available > 0 ? GREEN : RED }]} />
                    <Text style={styles.statNum}>{station.num_docks_available ?? '—'}</Text>
                    <Text style={styles.statLabel}>Docks</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="bicycle-outline" size={14} color={MUTED} />
                    <Text style={styles.statNum}>{station.capacity ?? '—'}</Text>
                    <Text style={styles.statLabel}>Capacity</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.rentBtn, station.num_bikes_available === 0 && styles.rentBtnDisabled]}
                  disabled={station.num_bikes_available === 0}
                  onPress={() => Linking.openURL('https://bikesharetoronto.com')}
                >
                  <Ionicons
                    name={station.num_bikes_available > 0 ? 'bicycle' : 'bicycle-outline'}
                    size={16}
                    color={station.num_bikes_available > 0 ? DARK : MUTED}
                  />
                  <Text style={[styles.rentBtnText, station.num_bikes_available === 0 && styles.rentBtnTextDisabled]}>
                    {station.num_bikes_available > 0 ? 'Rent a Bike' : 'No Bikes Available'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={GOLD} />
          <Text style={styles.infoText}>
            Real-time data from Bike Share Toronto. Pull to refresh. Tap navigate for directions.
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
  refreshBtn: {
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
  heroTitle: { fontSize: 18, fontWeight: '800', color: CARD, marginBottom: 4 },
  heroSub: { fontSize: 13, color: MUTED },
  heroUpdated: { fontSize: 11, color: '#666', marginTop: 4 },
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
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER,
  },
  filterBtnActive: { backgroundColor: DARK, borderColor: DARK },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: DARK },
  filterBtnTextActive: { color: GOLD },

  legend: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: 16, marginBottom: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: MUTED },

  listContainer: { paddingHorizontal: 16, gap: 12 },

  stationCard: {
    backgroundColor: CARD, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  stationTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stationIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  stationInfo: { flex: 1 },
  stationName: { fontSize: 14, fontWeight: '700', color: DARK, lineHeight: 20 },
  stationAddress: { fontSize: 12, color: MUTED, marginTop: 2 },
  mapBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F0E4B8',
  },

  stationStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9F9F9', borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statNum: { fontSize: 18, fontWeight: '700', color: DARK },
  statLabel: { fontSize: 11, color: MUTED },
  statDivider: { width: 1, height: 30, backgroundColor: BORDER },

  rentBtn: {
    backgroundColor: GOLD, borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  rentBtnDisabled: { backgroundColor: '#F5F5F5' },
  rentBtnText: { fontSize: 14, fontWeight: '700', color: DARK },
  rentBtnTextDisabled: { color: MUTED },

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

  skeletonCard: { height: 160, backgroundColor: '#E8E8E8', borderRadius: 16 },
})

