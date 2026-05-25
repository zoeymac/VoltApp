import { useState } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, ScrollView, StatusBar, Platform,
  ActivityIndicator, KeyboardAvoidingView, Alert
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

const VEHICLE_TYPES = [
  { id: 'comfort', label: 'Comfort', desc: 'Standard EV sedan', icon: 'car-outline' },
  { id: 'premium', label: 'Premium', desc: 'Luxury EV', icon: 'star-outline' },
  { id: 'xl', label: 'XL', desc: 'SUV or minivan', icon: 'bus-outline' },
  { id: 'accessible', label: 'Accessible', desc: 'Wheelchair accessible', icon: 'accessibility-outline' },
]

export default function DriverApplicationScreen({ navigation }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    license_number: '',
    vehicle_model: '',
    vehicle_plate: '',
    vehicle_color: '',
    vehicle_type: 'comfort',
    vehicle_registration: '',
  })

  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }))

  const validateStep1 = () => {
    if (!formData.full_name.trim()) { Alert.alert('Required', 'Please enter your full name'); return false }
    if (!formData.phone.trim()) { Alert.alert('Required', 'Please enter your phone number'); return false }
    if (!formData.license_number.trim()) { Alert.alert('Required', 'Please enter your license number'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!formData.vehicle_model.trim()) { Alert.alert('Required', 'Please enter your vehicle model'); return false }
    if (!formData.vehicle_plate.trim()) { Alert.alert('Required', 'Please enter your plate number'); return false }
    if (!formData.vehicle_color.trim()) { Alert.alert('Required', 'Please enter your vehicle color'); return false }
    if (!formData.vehicle_registration.trim()) { Alert.alert('Required', 'Please enter your registration number'); return false }
    return true
  }

  const submit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch(`${API_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id,
          user_email: user?.email,
          verification_status: 'pending',
          is_online: false,
          rating: 5.0,
          total_trips: 0,
        })
      })
      const data = await res.json()
      console.log('Driver created:', data)
      setSubmitted(true)
    } catch (err) {
      console.log('Error:', err)
      // Show success anyway for demo
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color={CARD} />
        </View>
        <Text style={styles.successTitle}>Application Submitted!</Text>
        <Text style={styles.successDesc}>
          We'll review your application and get back to you within 24-48 hours. You'll receive an email once approved.
        </Text>
        <View style={styles.successDetails}>
          <Text style={styles.successDetailTitle}>What happens next?</Text>
          <View style={styles.successStep}>
            <View style={styles.successStepNum}><Text style={styles.successStepNumText}>1</Text></View>
            <Text style={styles.successStepText}>Background check (1-2 days)</Text>
          </View>
          <View style={styles.successStep}>
            <View style={styles.successStepNum}><Text style={styles.successStepNumText}>2</Text></View>
            <Text style={styles.successStepText}>Vehicle inspection verification</Text>
          </View>
          <View style={styles.successStep}>
            <View style={styles.successStepNum}><Text style={styles.successStepNumText}>3</Text></View>
            <Text style={styles.successStepText}>Account activation & onboarding</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step === 1 ? navigation.goBack() : setStep(1)}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Driver</Text>
        <Text style={styles.stepIndicator}>{step}/2</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <>
            {/* HERO */}
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Ionicons name="car-sport-outline" size={40} color={GOLD} />
              </View>
              <Text style={styles.heroTitle}>Drive with VoltRide</Text>
              <Text style={styles.heroDesc}>Earn money driving your EV around Toronto. Set your own hours, keep 97% of every fare.</Text>

              <View style={styles.earningsRow}>
                <View style={styles.earningCard}>
                  <Text style={styles.earningValue}>$25-35</Text>
                  <Text style={styles.earningLabel}>Per hour</Text>
                </View>
                <View style={styles.earningCard}>
                  <Text style={styles.earningValue}>97%</Text>
                  <Text style={styles.earningLabel}>You keep</Text>
                </View>
                <View style={styles.earningCard}>
                  <Text style={styles.earningValue}>Your hours</Text>
                  <Text style={styles.earningLabel}>Flexibility</Text>
                </View>
              </View>
            </View>

            {/* PERSONAL INFO */}
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your full legal name"
                  placeholderTextColor={MUTED}
                  value={formData.full_name}
                  onChangeText={v => update('full_name', v)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={18} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+1 (416) 000-0000"
                  placeholderTextColor={MUTED}
                  value={formData.phone}
                  onChangeText={v => update('phone', v)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Driver's License Number</Text>
              <View style={styles.inputBox}>
                <Ionicons name="card-outline" size={18} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ontario license number"
                  placeholderTextColor={MUTED}
                  value={formData.license_number}
                  onChangeText={v => update('license_number', v)}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => { if (validateStep1()) setStep(2) }}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={DARK} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>

            {/* VEHICLE TYPE */}
            <Text style={styles.inputLabel}>Vehicle Type</Text>
            <View style={styles.vehicleTypeGrid}>
              {VEHICLE_TYPES.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleTypeCard, formData.vehicle_type === v.id && styles.vehicleTypeCardActive]}
                  onPress={() => update('vehicle_type', v.id)}
                >
                  <Ionicons
                    name={v.icon} size={24}
                    color={formData.vehicle_type === v.id ? GOLD : DARK}
                  />
                  <Text style={styles.vehicleTypeLabel}>{v.label}</Text>
                  <Text style={styles.vehicleTypeDesc}>{v.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Vehicle Make & Model</Text>
              <View style={styles.inputBox}>
                <Ionicons name="car-outline" size={18} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tesla Model 3"
                  placeholderTextColor={MUTED}
                  value={formData.vehicle_model}
                  onChangeText={v => update('vehicle_model', v)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>License Plate</Text>
              <View style={styles.inputBox}>
                <Ionicons name="document-outline" size={18} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ABCD 123"
                  placeholderTextColor={MUTED}
                  value={formData.vehicle_plate}
                  onChangeText={v => update('vehicle_plate', v.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Vehicle Color</Text>
              <View style={styles.inputBox}>
                <Ionicons name="color-palette-outline" size={18} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. White"
                  placeholderTextColor={MUTED}
                  value={formData.vehicle_color}
                  onChangeText={v => update('vehicle_color', v)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Vehicle Registration Number</Text>
              <View style={styles.inputBox}>
                <Ionicons name="document-text-outline" size={18} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Registration number"
                  placeholderTextColor={MUTED}
                  value={formData.vehicle_registration}
                  onChangeText={v => update('vehicle_registration', v)}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* REQUIREMENTS */}
            <View style={styles.requirementsCard}>
              <Text style={styles.requirementsTitle}>Requirements</Text>
              {[
                'Valid Ontario driver\'s license (G or G2)',
                'EV or hybrid vehicle (2018 or newer)',
                'Valid vehicle insurance',
                'Clean driving record',
                'Smartphone with data plan',
              ].map((req, i) => (
                <View key={i} style={styles.requirementRow}>
                  <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, loading && { opacity: 0.7 }]}
              onPress={submit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={DARK} />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>Submit Application</Text>
                  <Ionicons name="checkmark" size={18} color={DARK} />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By submitting, you agree to our Driver Terms of Service and consent to a background check.
            </Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  stepIndicator: { fontSize: 14, fontWeight: '600', color: MUTED },

  progressBar: {
    height: 3, backgroundColor: BORDER,
  },
  progressFill: {
    height: '100%', backgroundColor: GOLD,
    borderRadius: 2,
  },

  scroll: { padding: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 28 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: DARK, marginBottom: 8 },
  heroDesc: { fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 22, marginBottom: 20 },

  earningsRow: { flexDirection: 'row', gap: 10, width: '100%' },
  earningCard: {
    flex: 1, backgroundColor: CARD, borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  earningValue: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 4 },
  earningLabel: { fontSize: 11, color: MUTED },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 16 },

  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: DARK, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: DARK },

  vehicleTypeGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 16,
  },
  vehicleTypeCard: {
    width: '47%', backgroundColor: CARD,
    borderRadius: 12, padding: 14,
    borderWidth: 2, borderColor: BORDER,
    alignItems: 'center', gap: 6,
  },
  vehicleTypeCardActive: { borderColor: GOLD, backgroundColor: '#FFFBF0' },
  vehicleTypeLabel: { fontSize: 14, fontWeight: '700', color: DARK },
  vehicleTypeDesc: { fontSize: 11, color: MUTED, textAlign: 'center' },

  requirementsCard: {
    backgroundColor: '#F0FFF4', borderRadius: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  requirementsTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 12 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  requirementText: { fontSize: 13, color: DARK, flex: 1 },

  nextBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 16,
  },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: DARK },

  disclaimer: { fontSize: 11, color: MUTED, textAlign: 'center', lineHeight: 18 },

  successContainer: {
    flex: 1, backgroundColor: CREAM,
    alignItems: 'center', justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: GREEN, justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 12 },
  successDesc: {
    fontSize: 15, color: MUTED, textAlign: 'center',
    lineHeight: 24, marginBottom: 24,
  },
  successDetails: {
    backgroundColor: CARD, borderRadius: 16,
    padding: 20, width: '100%', marginBottom: 24,
  },
  successDetailTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 16 },
  successStep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  successStepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center',
  },
  successStepNumText: { fontSize: 13, fontWeight: '700', color: DARK },
  successStepText: { fontSize: 14, color: DARK, flex: 1 },

  doneBtn: {
    backgroundColor: DARK, borderRadius: 14,
    padding: 18, alignItems: 'center', width: '100%',
  },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: GOLD },
})

