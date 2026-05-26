import { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, ScrollView, Animated, Dimensions,
  StatusBar, Platform, Modal
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'

const { height, width } = Dimensions.get('window')

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const GREEN = '#22c55e'
const RED = '#ef4444'

const API_URL = 'http://10.0.0.100:3000'

const mockDrivers = [
  { name: 'Alex Chen', rating: 4.9, model: 'Tesla Model 3', plate: 'EV-2024', eta: 4 },
  { name: 'Sarah Johnson', rating: 4.8, model: 'Polestar 2', plate: 'GREEN-1', eta: 6 },
  { name: 'Marcus Lee', rating: 4.95, model: 'Tesla Model Y', plate: 'ZERO-EM', eta: 3 },
]

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c54' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3d6b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
]

export default function HomeScreen({ navigation }) {
  const [pickup, setPickup] = useState('Current Location')
  const [userName, setUserName] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('comfort')
  const [allowsPets, setAllowsPets] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [showPromo, setShowPromo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [step, setStep] = useState('booking')
  const [activeRide, setActiveRide] = useState(null)
  const [matchedDriver, setMatchedDriver] = useState(null)
  const [eta, setEta] = useState(null)
  const [showCancel, setShowCancel] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [carbonSaved] = useState((Math.random() * 3 + 1).toFixed(1))
  const [searchSeconds, setSearchSeconds] = useState(0)
  const [userLocation, setUserLocation] = useState({
    latitude: 43.6205,
    longitude: -79.5132,
  })

  const shimmer = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(1)).current
  const mapRef = useRef(null)
  const searchTimer = useRef(null)
  const etaTimer = useRef(null)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start()
    setTimeout(() => setLoading(false), 1500)
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
        setUserName(name)
      } catch (err) {
        console.log('User error:', err)
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') return
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        })
        const { latitude, longitude } = location.coords
        setUserLocation({ latitude, longitude })

        // Animate map to real location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000)
        }

        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (geocode.length > 0) {
          const addr = geocode[0]
          const street = addr.street ? `${addr.streetNumber || ''} ${addr.street}`.trim() : ''
          const city = addr.city || addr.subregion || ''
          setPickup(street ? `${street}, ${city}` : city || 'Current Location')
        }
      } catch (err) {
        console.log('Location error:', err)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (step === 'searching') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start()
      searchTimer.current = setInterval(() => {
        setSearchSeconds(s => s + 1)
      }, 1000)
      setTimeout(() => {
        const driver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)]
        setMatchedDriver(driver)
        setEta(driver.eta)
        setStep('matched')
        clearInterval(searchTimer.current)
      }, 4000)
    }
    return () => clearInterval(searchTimer.current)
  }, [step])

  useEffect(() => {
    if (step === 'matched' || step === 'arriving') {
      etaTimer.current = setInterval(() => {
        setEta(e => {
          if (e <= 1) {
            clearInterval(etaTimer.current)
            if (step === 'matched') setStep('arriving')
            return 0
          }
          return e - 1
        })
      }, 60000)
    }
    return () => clearInterval(etaTimer.current)
  }, [step])

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1]
  })

  const vehicles = [
    { id: 'comfort', label: 'Comfort', icon: 'car-outline', price: '$12', desc: '4 seats' },
    { id: 'premium', label: 'Premium', icon: 'star-outline', price: '$18', desc: 'Luxury EV' },
    { id: 'xl', label: 'XL', icon: 'bus-outline', price: '$22', desc: '6 seats' },
    { id: 'accessible', label: 'Access', icon: 'accessibility-outline', price: '$12', desc: 'Accessible' },
  ]

 const quickActions = [
  { icon: 'time-outline', label: 'Schedule', screen: 'ScheduleRide' },
  { icon: 'bicycle-outline', label: 'Rent Bike', screen: null },
  { icon: 'car-outline', label: 'Rent EV', screen: 'RentEV' },
]

  const menuItems = [
  { icon: 'time-outline', label: 'My Rides', screen: 'RideHistory' },
  { icon: 'car-outline', label: 'Rent EV', screen: 'RentEV' },
  { icon: 'bicycle-outline', label: 'Rent Bike', screen: null },
  { icon: 'person-add-outline', label: 'Become a Driver', screen: 'DriverApplication' },
  { icon: 'calendar-outline', label: 'Scheduled Rides', screen: 'ScheduleRide' },
]

  const getPrice = () => {
    const prices = { comfort: 12, premium: 18, xl: 22, accessible: 12 }
    return prices[selectedVehicle] || 12
  }

  const requestRide = async () => {
    if (!destination) return
    setStep('searching')
    setSearchSeconds(0)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: pickup,
          dropoff: destination,
          vehicle_type: selectedVehicle,
          base_price: getPrice(),
          surge_multiplier: 1.0,
          status: 'searching',
          rider_id: user?.id || 'a727848a-d648-490e-9a57-d7484e22c2b8',
        })
      })
      const data = await res.json()
      setActiveRide(data)
    } catch (err) {
      console.log('API error, using mock:', err)
    }
  }

  const cancelRide = () => {
    setShowCancel(false)
    setStep('booking')
    setActiveRide(null)
    setMatchedDriver(null)
    setDestination('')
    clearInterval(searchTimer.current)
    clearInterval(etaTimer.current)
  }

  const completeRide = () => {
    setStep('complete')
    setShowRating(true)
  }

  const submitRating = (stars) => {
    setRating(stars)
    setShowRating(false)
    setStep('booking')
    setDestination('')
    setMatchedDriver(null)
    setActiveRide(null)
  }

  const renderSheet = () => {
    if (loading) {
      return (
        <>
          <Animated.View style={[styles.skeletonCard, { opacity: skeletonOpacity }]} />
          <View style={styles.quickRow}>
            {[1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.skeletonAction, { opacity: skeletonOpacity }]} />
            ))}
          </View>
          <Animated.View style={[styles.skeletonInput, { opacity: skeletonOpacity }]} />
        </>
      )
    }

    if (step === 'booking') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>
              {userName ? `Welcome back, ${userName.split(' ')[0]}!` : 'Welcome back!'}
            </Text>
            <Text style={styles.welcomeSub}>Let's get you moving with zero emissions</Text>
          </View>

          <View style={styles.quickRow}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickAction}
                onPress={() => a.screen && navigation.navigate(a.screen)}
              >
                <Ionicons name={a.icon} size={26} color={DARK} style={{ marginBottom: 6 }} />
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <View style={styles.dotGold} />
              <Text style={styles.locationText} numberOfLines={1}>{pickup}</Text>
              <Ionicons name="navigate-outline" size={18} color={GOLD} />
            </View>
            <View style={{ paddingLeft: 5 }}>
              <View style={styles.locationDivider} />
            </View>
            <View style={styles.locationRow}>
              <View style={styles.dotDark} />
              <TextInput
                style={styles.locationInput}
                placeholder="Where to?"
                placeholderTextColor={MUTED}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          {destination.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Select ride type</Text>
              <View style={styles.vehicleGrid}>
                {vehicles.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.vehicleCard, selectedVehicle === v.id && styles.vehicleCardActive]}
                    onPress={() => setSelectedVehicle(v.id)}
                  >
                    <Ionicons
                      name={v.icon} size={26}
                      color={selectedVehicle === v.id ? GOLD : DARK}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.vehicleLabel}>{v.label}</Text>
                    <Text style={[styles.vehiclePrice, selectedVehicle === v.id && styles.vehiclePriceActive]}>
                      {v.price}
                    </Text>
                    <Text style={styles.vehicleDesc}>{v.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.extrasRow}>
                <TouchableOpacity
                  style={[styles.extraBtn, allowsPets && styles.extraBtnActive]}
                  onPress={() => setAllowsPets(!allowsPets)}
                >
                  <Text style={styles.extraBtnText}>🐾 Pets</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.extraBtn}
                  onPress={() => setShowPromo(!showPromo)}
                >
                  <Text style={styles.extraBtnText}>🏷️ Promo</Text>
                </TouchableOpacity>
              </View>

              {showPromo && (
                <View style={styles.promoRow}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Enter promo code"
                    placeholderTextColor={MUTED}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.promoBtn}>
                    <Text style={styles.promoBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.priceSummary}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base fare</Text>
                  <Text style={styles.priceValue}>${getPrice().toFixed(2)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>🌱 Carbon saved</Text>
                  <Text style={[styles.priceValue, { color: GREEN }]}>{carbonSaved} kg CO₂</Text>
                </View>
                <View style={[styles.priceRow, { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 8, paddingTop: 8 }]}>
                  <Text style={[styles.priceLabel, { fontWeight: '700' }]}>Total</Text>
                  <Text style={[styles.priceValue, { fontWeight: '700', fontSize: 18 }]}>${getPrice().toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.requestBtn} onPress={requestRide}>
                <Text style={styles.requestBtnText}>Request Ride ⚡</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )
    }

    if (step === 'searching') {
      return (
        <View style={styles.centerContent}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulse }] }]} />
          <View style={styles.pulseInner}>
            <Text style={styles.pulseEmoji}>⚡</Text>
          </View>
          <Text style={styles.searchingTitle}>Finding your driver...</Text>
          <Text style={styles.searchingDesc}>Looking for nearby EVs</Text>
          <Text style={styles.searchTimer}>{searchSeconds}s</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancel(true)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (step === 'matched' || step === 'arriving') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.statusBanner, { backgroundColor: step === 'arriving' ? '#FFF3E0' : '#F0FFF4' }]}>
            <Text style={styles.statusBannerText}>
              {step === 'arriving' ? '🚗 Driver is arriving!' : `⚡ Driver matched — ${eta} min away`}
            </Text>
          </View>

          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>{matchedDriver?.name?.charAt(0)}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{matchedDriver?.name}</Text>
              <Text style={styles.driverVehicle}>{matchedDriver?.model} · {matchedDriver?.plate}</Text>
              <View style={styles.driverRatingRow}>
                <Ionicons name="star" size={14} color={GOLD} />
                <Text style={styles.driverRating}>{matchedDriver?.rating}</Text>
              </View>
            </View>
            <View style={styles.etaBox}>
              <Text style={styles.etaNumber}>{eta}</Text>
              <Text style={styles.etaLabel}>min</Text>
            </View>
          </View>

          <View style={styles.tripDetails}>
            <View style={styles.tripRow}>
              <View style={styles.dotGold} />
              <Text style={styles.tripText}>{pickup}</Text>
            </View>
            <View style={{ paddingLeft: 5, marginVertical: 2 }}>
              <View style={styles.locationDivider} />
            </View>
            <View style={styles.tripRow}>
              <View style={styles.dotDark} />
              <Text style={styles.tripText}>{destination}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={20} color={DARK} />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="call-outline" size={20} color={DARK} />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="shield-checkmark-outline" size={20} color={DARK} />
              <Text style={styles.actionBtnText}>Safety</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-outline" size={20} color={DARK} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          {step === 'arriving' && (
            <TouchableOpacity style={styles.requestBtn} onPress={() => setStep('inprogress')}>
              <Text style={styles.requestBtnText}>Start Ride</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelLinkBtn} onPress={() => setShowCancel(true)}>
            <Text style={styles.cancelLinkText}>Cancel ride</Text>
          </TouchableOpacity>
        </ScrollView>
      )
    }

    if (step === 'inprogress') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.inProgressIcon}>
            <Ionicons name="flash" size={40} color={GOLD} />
          </View>
          <Text style={styles.searchingTitle}>Ride in progress</Text>
          <Text style={styles.searchingDesc}>{destination}</Text>
          <View style={styles.carbonBadge}>
            <Text style={styles.carbonText}>🌱 Saving {carbonSaved} kg CO₂</Text>
          </View>
          <TouchableOpacity style={styles.requestBtn} onPress={completeRide}>
            <Text style={styles.requestBtnText}>Complete Ride</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return null
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={darkMapStyle}
      >
        <Marker coordinate={userLocation}>
          <View style={styles.userMarker}>
            <View style={styles.userMarkerDot} />
          </View>
        </Marker>
      </MapView>

      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>⚡</Text>
          <Text style={styles.logoText}>VoltRide</Text>
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ChargingStations')}>
            <Ionicons name="flash-outline" size={18} color={DARK} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={18} color={DARK} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={18} color={DARK} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="menu-outline" size={20} color={DARK} />
          </TouchableOpacity>
        </View>
      </View>

      {menuOpen && (
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={() => setMenuOpen(false)}
          activeOpacity={1}
        >
          <View style={styles.dropdown}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dropdownItem, i < menuItems.length - 1 && styles.dropdownItemBorder]}
                onPress={() => {
                  setMenuOpen(false)
                  if (item.screen) navigation.navigate(item.screen)
                }}
              >
                <Ionicons name={item.icon} size={18} color={DARK} style={{ marginRight: 12 }} />
                <Text style={styles.dropdownLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        {renderSheet()}
      </View>

      <Modal visible={showCancel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel ride?</Text>
            <Text style={styles.modalDesc}>
              {step === 'searching'
                ? 'No fee to cancel now.'
                : 'A cancellation fee of $3-8 may apply.'}
            </Text>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelRide}>
              <Text style={styles.modalCancelText}>Yes, cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalKeepBtn} onPress={() => setShowCancel(false)}>
              <Text style={styles.modalKeepText}>Keep ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRating} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate your ride</Text>
            <Text style={styles.modalDesc}>How was your trip with {matchedDriver?.name}?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => submitRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40} color={GOLD}
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.carbonBadge}>
              <Text style={styles.carbonText}>🌱 You saved {carbonSaved} kg CO₂!</Text>
            </View>
            <TouchableOpacity style={styles.modalKeepBtn} onPress={() => submitRating(0)}>
              <Text style={styles.modalKeepText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  map: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55 },

  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 40,
    left: 16, right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  logoIcon: { fontSize: 18, marginRight: 6 },
  logoText: { fontWeight: '700', fontSize: 16, color: DARK },
  topIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },

  menuOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 15,
  },
  dropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 104 : 90,
    right: 16,
    backgroundColor: CARD, borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    minWidth: 200,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownItemBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  dropdownLabel: { fontSize: 15, color: DARK, fontWeight: '500' },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    top: height * 0.45,
    backgroundColor: CREAM,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 20,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: '#DDD',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },

  welcomeCard: {
    backgroundColor: '#FFF8E7', borderRadius: 14,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#F0E4B8',
    alignItems: 'center',
  },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 4, textAlign: 'center' },
  welcomeSub: { fontSize: 13, color: MUTED, textAlign: 'center' },

  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  quickAction: {
    flex: 1, backgroundColor: CARD, borderRadius: 14,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: DARK },

  locationCard: {
    backgroundColor: CARD, borderRadius: 14,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dotGold: { width: 12, height: 12, borderRadius: 6, backgroundColor: GOLD, marginRight: 12 },
  dotDark: { width: 12, height: 12, borderRadius: 6, backgroundColor: DARK, marginRight: 12 },
  locationDivider: { width: 2, height: 16, backgroundColor: '#DDD', marginVertical: 2 },
  locationText: { flex: 1, fontSize: 15, color: DARK, fontWeight: '500' },
  locationInput: { flex: 1, fontSize: 15, color: DARK },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 10 },
  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  vehicleCard: {
    width: (width - 52) / 2, backgroundColor: CARD,
    borderRadius: 14, padding: 16,
    borderWidth: 2, borderColor: BORDER,
  },
  vehicleCardActive: { borderColor: GOLD, backgroundColor: '#FFFBF0' },
  vehicleLabel: { fontSize: 14, fontWeight: '600', color: DARK },
  vehiclePrice: { fontSize: 16, fontWeight: '700', color: MUTED, marginTop: 2 },
  vehiclePriceActive: { color: GOLD },
  vehicleDesc: { fontSize: 11, color: MUTED, marginTop: 2 },

  extrasRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  extraBtn: {
    flex: 1, backgroundColor: CARD, borderRadius: 10,
    padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  extraBtnActive: { borderColor: GOLD, backgroundColor: '#FFFBF0' },
  extraBtnText: { fontSize: 13, fontWeight: '600', color: DARK },

  promoRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  promoInput: {
    flex: 1, backgroundColor: CARD, borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: BORDER,
    fontSize: 14, color: DARK,
  },
  promoBtn: {
    backgroundColor: DARK, borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  promoBtnText: { color: GOLD, fontWeight: '700' },

  priceSummary: {
    backgroundColor: CARD, borderRadius: 14,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: 14, color: MUTED },
  priceValue: { fontSize: 14, color: DARK, fontWeight: '600' },

  requestBtn: {
    backgroundColor: DARK, borderRadius: 14,
    padding: 18, alignItems: 'center', marginBottom: 20,
  },
  requestBtnText: { color: GOLD, fontWeight: '700', fontSize: 16 },

  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  pulseCircle: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: `${GOLD}33`,
  },
  pulseInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: GOLD,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  pulseEmoji: { fontSize: 36 },
  searchingTitle: { fontSize: 20, fontWeight: '700', color: DARK, marginBottom: 8 },
  searchingDesc: { fontSize: 14, color: MUTED, marginBottom: 8 },
  searchTimer: { fontSize: 13, color: MUTED, marginBottom: 24 },
  cancelBtn: {
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 32, paddingVertical: 12,
  },
  cancelBtnText: { color: DARK, fontWeight: '600' },

  statusBanner: {
    borderRadius: 12, padding: 12,
    marginBottom: 14, alignItems: 'center',
  },
  statusBannerText: { fontSize: 14, fontWeight: '700', color: DARK },

  driverCard: {
    backgroundColor: CARD, borderRadius: 14,
    padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  driverAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: GOLD, justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  driverAvatarText: { fontSize: 24, fontWeight: '700', color: DARK },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: DARK },
  driverVehicle: { fontSize: 13, color: MUTED, marginTop: 2 },
  driverRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  driverRating: { fontSize: 13, fontWeight: '600', color: DARK, marginLeft: 4 },
  etaBox: { alignItems: 'center' },
  etaNumber: { fontSize: 28, fontWeight: '700', color: GOLD },
  etaLabel: { fontSize: 12, color: MUTED },

  tripDetails: {
    backgroundColor: CARD, borderRadius: 14,
    padding: 16, marginBottom: 14,
  },
  tripRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  tripText: { fontSize: 14, color: DARK, flex: 1 },

  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  actionBtn: {
    flex: 1, backgroundColor: CARD, borderRadius: 12,
    padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  actionBtnText: { fontSize: 11, color: DARK, marginTop: 4, fontWeight: '500' },

  cancelLinkBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelLinkText: { color: RED, fontWeight: '600', fontSize: 14 },

  inProgressIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: DARK, justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  carbonBadge: {
    backgroundColor: '#F0FFF4', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    marginVertical: 16,
  },
  carbonText: { fontSize: 13, color: GREEN, fontWeight: '600' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: CARD, borderRadius: 20,
    padding: 24, width: '100%', alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: DARK, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 24 },
  modalCancelBtn: {
    backgroundColor: RED, borderRadius: 12,
    padding: 16, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalCancelText: { color: CARD, fontWeight: '700', fontSize: 16 },
  modalKeepBtn: {
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, padding: 16,
    width: '100%', alignItems: 'center',
  },
  modalKeepText: { color: DARK, fontWeight: '600', fontSize: 16 },

  starsRow: { flexDirection: 'row', marginBottom: 20 },

  userMarker: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(232, 196, 104, 0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  userMarkerDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: GOLD,
    borderWidth: 2, borderColor: CARD,
  },

  skeletonCard: { height: 70, backgroundColor: '#E8E8E8', borderRadius: 14, marginBottom: 14 },
  skeletonAction: { flex: 1, height: 72, backgroundColor: '#E8E8E8', borderRadius: 14 },
  skeletonInput: { height: 84, backgroundColor: '#E8E8E8', borderRadius: 14, marginTop: 14 },
})

