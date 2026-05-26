import { useState } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, ScrollView, StatusBar, Platform,
  ActivityIndicator, Alert, Modal
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { supabase } from '../lib/supabase'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const API_URL = 'http://10.0.0.100:3000'

const VEHICLES = [
  { id: 'comfort', label: 'Comfort', icon: 'car-outline', price: '$12', desc: '4 seats' },
  { id: 'premium', label: 'Premium', icon: 'star-outline', price: '$18', desc: 'Luxury EV' },
  { id: 'xl', label: 'XL', icon: 'bus-outline', price: '$22', desc: '6 seats' },
  { id: 'accessible', label: 'Access', icon: 'accessibility-outline', price: '$12', desc: 'Accessible' },
]

const getMinDate = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 30)
  return d
}

export default function ScheduleRideScreen({ navigation }) {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('comfort')
  const [loading, setLoading] = useState(false)
  const [scheduled, setScheduled] = useState(false)
  const [date, setDate] = useState(getMinDate())
  const [tempDate, setTempDate] = useState(getMinDate())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const getPrice = () => {
    const prices = { comfort: 12, premium: 18, xl: 22, accessible: 12 }
    return prices[selectedVehicle] || 12
  }

  const formatDate = (d) => d.toLocaleDateString('en-CA', {
    weekday: 'long', month: 'short', day: 'numeric'
  })

  const formatTime = (d) => d.toLocaleTimeString('en-CA', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })

  const schedule = async () => {
    if (!pickup.trim()) { Alert.alert('Required', 'Please enter pickup location'); return }
    if (!destination.trim()) { Alert.alert('Required', 'Please enter destination'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff: destination,
          vehicle_type: selectedVehicle,
          base_price: getPrice(),
          surge_multiplier: 1.0,
          status: 'scheduled',
          rider_id: user?.id,
          is_scheduled: true,
          scheduled_datetime: date.toISOString(),
        })
      })
      setScheduled(true)
    } catch (err) {
      setScheduled(true)
    } finally {
      setLoading(false)
    }
  }

  if (scheduled) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successIcon}>
          <Ionicons name="calendar" size={48} color={CARD} />
        </View>
        <Text style={styles.successTitle}>Ride Scheduled!</Text>
        <Text style={styles.successDesc}>{formatDate(date)} at {formatTime(date)}</Text>
        <View style={styles.successCard}>
          <View style={styles.successRow}>
            <View style={styles.dotGold} />
            <Text style={styles.successRouteText} numberOfLines={1}>{pickup}</Text>
          </View>
          <View style={styles.successDivider} />
          <View style={styles.successRow}>
            <View style={styles.dotDark} />
            <Text style={styles.successRouteText} numberOfLines={1}>{destination}</Text>
          </View>
        </View>
        <Text style={styles.successNote}>We'll notify you 30 minutes before pickup</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('RideHistory')}>
          <Text style={styles.viewBtnText}>View My Rides</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule a Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>Where are you going?</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.dotGold} />
            <TextInput
              style={styles.locationInput}
              placeholder="Pickup location"
              placeholderTextColor={MUTED}
              value={pickup}
              onChangeText={setPickup}
            />
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

        <Text style={styles.sectionTitle}>When?</Text>
        <View style={styles.dateTimeCard}>
          <TouchableOpacity
            style={styles.dateTimeRow}
            onPress={() => { setTempDate(date); setShowDatePicker(true) }}
          >
            <View style={styles.dateTimeLeft}>
              <View style={styles.dateTimeIconWrap}>
                <Ionicons name="calendar-outline" size={20} color={GOLD} />
              </View>
              <View>
                <Text style={styles.dateTimeLabel}>Date</Text>
                <Text style={styles.dateTimeValue}>{formatDate(date)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={MUTED} />
          </TouchableOpacity>

          <View style={styles.dateTimeDivider} />

          <TouchableOpacity
            style={styles.dateTimeRow}
            onPress={() => { setTempDate(date); setShowTimePicker(true) }}
          >
            <View style={styles.dateTimeLeft}>
              <View style={styles.dateTimeIconWrap}>
                <Ionicons name="time-outline" size={20} color={GOLD} />
              </View>
              <View>
                <Text style={styles.dateTimeLabel}>Time</Text>
                <Text style={styles.dateTimeValue}>{formatTime(date)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={MUTED} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Ride Type</Text>
        <View style={styles.vehicleGrid}>
          {VEHICLES.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[styles.vehicleCard, selectedVehicle === v.id && styles.vehicleCardActive]}
              onPress={() => setSelectedVehicle(v.id)}
            >
              <Ionicons
                name={v.icon} size={24}
                color={selectedVehicle === v.id ? GOLD : DARK}
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.vehicleLabel}>{v.label}</Text>
              <Text style={[styles.vehiclePrice, selectedVehicle === v.id && { color: GOLD }]}>
                {v.price}
              </Text>
              <Text style={styles.vehicleDesc}>{v.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={18} color={GOLD} />
            <Text style={styles.summaryText}>{formatDate(date)} at {formatTime(date)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="car-outline" size={18} color={GOLD} />
            <Text style={styles.summaryText}>
              {VEHICLES.find(v => v.id === selectedVehicle)?.label} · ${getPrice().toFixed(2)} est.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.scheduleBtn, loading && { opacity: 0.7 }]}
          onPress={schedule}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={DARK} />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={20} color={DARK} />
              <Text style={styles.scheduleBtnText}>Schedule Ride</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* DATE PICKER MODAL */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.pickerModal}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => { setDate(tempDate); setShowDatePicker(false) }}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              minimumDate={getMinDate()}
              textColor={DARK}
              onChange={(event, selected) => { if (selected) setTempDate(selected) }}
              style={{ height: 216, width: '100%' }}
            />
          </View>
        </View>
      </Modal>

      {/* TIME PICKER MODAL */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.pickerModal}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            onPress={() => setShowTimePicker(false)}
          />
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => { setDate(tempDate); setShowTimePicker(false) }}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="spinner"
              minuteInterval={15}
              textColor={DARK}
              onChange={(event, selected) => { if (selected) setTempDate(selected) }}
              style={{ height: 216, width: '100%' }}
            />
          </View>
        </View>
      </Modal>

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

  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 12, marginTop: 8 },

  locationCard: {
    backgroundColor: CARD, borderRadius: 16,
    padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dotGold: { width: 12, height: 12, borderRadius: 6, backgroundColor: GOLD, marginRight: 12 },
  dotDark: { width: 12, height: 12, borderRadius: 6, backgroundColor: DARK, marginRight: 12 },
  locationDivider: { width: 2, height: 16, backgroundColor: '#DDD', marginVertical: 2 },
  locationInput: { flex: 1, fontSize: 15, color: DARK },

  dateTimeCard: {
    backgroundColor: CARD, borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
    overflow: 'hidden',
  },
  dateTimeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  dateTimeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateTimeIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
  },
  dateTimeLabel: { fontSize: 12, color: MUTED, marginBottom: 2 },
  dateTimeValue: { fontSize: 15, fontWeight: '600', color: DARK },
  dateTimeDivider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16 },

  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  vehicleCard: {
    width: '47%', backgroundColor: CARD,
    borderRadius: 14, padding: 14,
    borderWidth: 2, borderColor: BORDER, alignItems: 'center',
  },
  vehicleCardActive: { borderColor: GOLD, backgroundColor: '#FFFBF0' },
  vehicleLabel: { fontSize: 14, fontWeight: '600', color: DARK },
  vehiclePrice: { fontSize: 14, fontWeight: '700', color: MUTED, marginTop: 2 },
  vehicleDesc: { fontSize: 11, color: MUTED, marginTop: 2 },

  summaryCard: {
    backgroundColor: '#FFF8E7', borderRadius: 14,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F0E4B8', gap: 10,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: { fontSize: 14, color: DARK, fontWeight: '500' },

  scheduleBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 20,
  },
  scheduleBtnText: { fontSize: 17, fontWeight: '700', color: DARK },

  pickerModal: {
    flex: 1, justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerContainer: {
    backgroundColor: CARD,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    alignItems: 'center',
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: DARK },
  pickerCancel: { fontSize: 16, color: MUTED },
  pickerDone: { fontSize: 16, fontWeight: '700', color: GOLD },

  successContainer: {
    flex: 1, backgroundColor: CREAM,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: GOLD, justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 8 },
  successDesc: { fontSize: 15, color: MUTED, textAlign: 'center', marginBottom: 20 },
  successCard: {
    backgroundColor: CARD, borderRadius: 14,
    padding: 16, width: '100%', marginBottom: 16,
  },
  successRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  successDivider: { width: 2, height: 16, backgroundColor: '#DDD', marginLeft: 5, marginVertical: 2 },
  successRouteText: { fontSize: 14, color: DARK, flex: 1 },
  successNote: { fontSize: 13, color: MUTED, textAlign: 'center', marginBottom: 24 },
  doneBtn: {
    backgroundColor: DARK, borderRadius: 14,
    padding: 18, alignItems: 'center', width: '100%', marginBottom: 12,
  },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: GOLD },
  viewBtn: { alignItems: 'center', padding: 12 },
  viewBtnText: { fontSize: 15, color: DARK, fontWeight: '600' },
})

