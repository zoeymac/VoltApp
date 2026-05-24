import { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, TextInput, Linking, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const GREEN = '#22c55e'
const BLUE = '#3b82f6'

const TORONTO_STATION_INFO = 'https://tor.publicbikesystem.net/customer/gbfs/v2/en/station_information'
const TORONTO_STATION_STATUS = 'https://tor.publicbikesystem.net/customer/gbfs/v2/en/station_status'

const sampleChargers = [
  {
    id: '1', name: 'ChargePoint - Etobicoke Centre',
    address: '1 Civic Centre Ct, Etobicoke',
    charger_type: 'DC Fast', available_ports: 3, total_ports: 4,
    price_per_kwh: 0.31, network: 'ChargePoint',
    rating: 4.6, hours: 'Open 24/7',
    amenities: ['Restrooms', 'WiFi', 'Coffee'],
  },
  {
    id: '2', name: 'Tesla Supercharger - Sherway Gardens',
    address: '25 The West Mall, Etobicoke',
    charger_type: 'Tesla Supercharger', available_ports: 8, total_ports: 10,
    price_per_kwh: 0.28, network: 'Tesla',
    rating: 4.9, hours: 'Open 24/7',
    amenities: ['Shopping', 'Food', 'Parking'],
  },
  {
    id: '3', name: 'EVgo - Kipling Station',
    address: '5765 Eglinton Ave W, Etobicoke',
    charger_type: 'DC Fast', available_ports: 1, total_ports: 4,
    price_per_kwh: 0.42, network: 'EVgo',
    rating: 4.2, hours: '6am - 12am',
    amenities: ['Transit', 'Food'],
  },
  {
    id: '4', name: 'Electrify Canada - Cloverdale Mall',
    address: '250 The East Mall, Etobicoke',
    charger_type: 'DC Fast', available_ports: 5, total_ports: 6,
    price_per_kwh: 0.33, network: 'Electrify Canada',
    rating: 4.5, hours: 'Open 24/7',
    amenities: ['Shopping', 'Food', 'Restrooms'],
  },
  {
    id: '5', name: 'Blink Charging - Humber College',
    address: '203 Humber College Blvd, Etobicoke',
    charger_type: 'Level 2', available_ports: 0, total_ports: 4,
    price_per_kwh: 0.25, network: 'Blink',
    rating: 4.0, hours: '7am - 10pm',
    amenities: ['Parking'],
  },
]

export default function ChargingStationsScreen({ navigation }) {
  const [stations] = useState(sampleChargers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start()
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1]
  })

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available' },
    { id: 'fast', label: 'DC Fast' },
    { id: 'tesla', label: 'Tesla' },
  ]

  const filteredStations = stations.filter(s => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
    if (filter === 'available') return matchesSearch && s.available_ports > 0
    if (filter === 'fast') return matchesSearch && s.charger_type === 'DC Fast'
    if (filter === 'tesla') return matchesSearch && s.network === 'Tesla'
    return matchesSearch
  })

  const totalAvailable = stations.reduce((sum, s) => sum + s.available_ports, 0)
  const totalPorts = stations.reduce((sum, s) => sum + s.total_ports, 0)

  const getAvailabilityColor = (available, total) => {
    if (available === 0) return '#ef4444'
    if (available / total < 0.5) return GOLD
    return GREEN
  }

  const openMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    Linking.openURL(url)
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Charging Stations</Text>
          <Text style={styles.headerSub}>Etobicoke & GTA</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STATS BANNER */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stations.length}</Text>
            <Text style={styles.statLabel}>Stations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: GREEN }]}>{totalAvailable}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalPorts}</Text>
            <Text style={styles.statLabel}>Total Ports</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={MUTED} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stations..."
              placeholderTextColor={MUTED}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {filters.map(f => (
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

        {/* STATIONS LIST */}
        <View style={styles.listContainer}>
          {loading ? (
            [1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.skeletonCard, { opacity: skeletonOpacity }]} />
            ))
          ) : filteredStations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flash-outline" size={48} color={MUTED} />
              <Text style={styles.emptyTitle}>No stations found</Text>
              <Text style={styles.emptyDesc}>Try changing your search or filter</Text>
            </View>
          ) : (
            filteredStations.map(station => (
              <View key={station.id} style={styles.stationCard}>
                {/* TOP ROW */}
                <View style={styles.stationTop}>
                  <View style={styles.stationIconWrap}>
                    <Ionicons name="flash" size={22} color={GOLD} />
                  </View>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <Text style={styles.stationAddress}>{station.address}</Text>
                    <View style={styles.stationMeta}>
                      <Text style={styles.networkBadge}>{station.network}</Text>
                      <Text style={styles.typeBadge}>{station.charger_type}</Text>
                    </View>
                  </View>
                </View>

                {/* AVAILABILITY */}
                <View style={styles.availabilityRow}>
                  <View style={styles.availabilityLeft}>
                    <View style={[
                      styles.availabilityDot,
                      { backgroundColor: getAvailabilityColor(station.available_ports, station.total_ports) }
                    ]} />
                    <Text style={styles.availabilityText}>
                      {station.available_ports}/{station.total_ports} ports available
                    </Text>
                  </View>
                  <Text style={styles.priceText}>${station.price_per_kwh}/kWh</Text>
                </View>

                {/* PROGRESS BAR */}
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${(station.available_ports / station.total_ports) * 100}%`,
                      backgroundColor: getAvailabilityColor(station.available_ports, station.total_ports)
                    }
                  ]} />
                </View>

                {/* AMENITIES */}
                <View style={styles.amenitiesRow}>
                  {station.amenities.map((a, i) => (
                    <View key={i} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{a}</Text>
                    </View>
                  ))}
                </View>

                {/* FOOTER */}
                <View style={styles.stationFooter}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={GOLD} />
                    <Text style={styles.ratingText}>{station.rating}</Text>
                    <Text style={styles.hoursText}>· {station.hours}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.navigateBtn}
                    onPress={() => openMaps(station.address)}
                  >
                    <Ionicons name="navigate-outline" size={16} color={DARK} />
                    <Text style={styles.navigateBtnText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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

  statsBanner: {
    flexDirection: 'row', backgroundColor: CARD,
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', color: DARK },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: BORDER, marginVertical: 4 },

  searchRow: { paddingHorizontal: 16, marginTop: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: BORDER,
  },
  searchInput: { flex: 1, fontSize: 15, color: DARK },

  filtersRow: { marginTop: 12, marginBottom: 4 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: CARD,
    borderWidth: 1, borderColor: BORDER,
  },
  filterBtnActive: { backgroundColor: DARK, borderColor: DARK },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: DARK },
  filterBtnTextActive: { color: GOLD },

  listContainer: { padding: 16, gap: 12 },

  stationCard: {
    backgroundColor: CARD, borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  stationTop: { flexDirection: 'row', marginBottom: 12 },
  stationIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  stationInfo: { flex: 1 },
  stationName: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 2 },
  stationAddress: { fontSize: 12, color: MUTED, marginBottom: 6 },
  stationMeta: { flexDirection: 'row', gap: 6 },
  networkBadge: {
    fontSize: 11, fontWeight: '600', color: BLUE,
    backgroundColor: '#EFF6FF', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 20,
  },
  typeBadge: {
    fontSize: 11, fontWeight: '600', color: MUTED,
    backgroundColor: '#F5F5F5', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 20,
  },

  availabilityRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  availabilityLeft: { flexDirection: 'row', alignItems: 'center' },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  availabilityText: { fontSize: 13, color: DARK, fontWeight: '500' },
  priceText: { fontSize: 13, fontWeight: '700', color: DARK },

  progressBar: {
    height: 4, backgroundColor: '#F0F0F0',
    borderRadius: 2, marginBottom: 12, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },

  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  amenityTag: {
    backgroundColor: '#F5F5F5', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  amenityText: { fontSize: 11, color: MUTED },

  stationFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingTop: 12,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: DARK },
  hoursText: { fontSize: 12, color: MUTED },
  navigateBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, gap: 4,
  },
  navigateBtnText: { fontSize: 13, fontWeight: '600', color: DARK },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: MUTED, textAlign: 'center' },

  skeletonCard: {
    height: 180, backgroundColor: '#E8E8E8',
    borderRadius: 16, marginBottom: 12,
  },
})

