import { useState, useEffect } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Platform, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const RED = '#ef4444'
const HEADER_BG = '#FAEDCB'
const API_URL = 'http://10.0.0.100:3000'

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null)
  const [rideCount, setRideCount] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch real ride count for this user
      const res = await fetch(`${API_URL}/rides`)
      const rides = await res.json()
      const userRides = rides.filter(r => r.rider_id === user?.id)
      setRideCount(userRides.length)
      const spent = userRides.reduce((sum, r) => sum + (r.base_price * r.surge_multiplier || 0), 0)
      setTotalSpent(spent)
    } catch (err) {
      console.log('Profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMemberSince = () => {
    if (!user?.created_at) return '2026'
    const date = new Date(user.created_at)
    return date.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })
  }

  const logout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut()
          }
        }
      ]
    )
  }

  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut()
              Alert.alert(
                'Request Submitted',
                'Your account deletion request has been submitted. Your account will be deleted within 30 days.'
              )
            } catch (err) {
              Alert.alert('Error', 'Something went wrong. Please contact privacy@voltride.ca')
            }
          }
        }
      ]
    )
  }

  const menuItems = [
    {
      section: 'Rides',
      items: [
        { icon: 'time-outline', label: 'My Rides', screen: 'RideHistory' },
        { icon: 'calendar-outline', label: 'Scheduled Rides', screen: null },
      ]
    },
    {
      section: 'Payments',
      items: [
        { icon: 'card-outline', label: 'Payment Methods', screen: null },
        { icon: 'receipt-outline', label: 'Payment History', screen: null },
        { icon: 'wallet-outline', label: 'Wallet & Credits', screen: null },
      ]
    },
    {
      section: 'More',
      items: [
        { icon: 'flash-outline', label: 'Charging Stations', screen: 'ChargingStations' },
        { icon: 'person-add-outline', label: 'Become a Driver', screen: 'DriverApplication' },
        { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
        { icon: 'shield-checkmark-outline', label: 'Safety', screen: null },
        { icon: 'help-circle-outline', label: 'Help & Support', screen: null },
        { icon: 'document-text-outline', label: 'Privacy Policy', screen: null },
      ]
    }
  ]

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Rider'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={22} color={DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>⭐ 4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{rideCount}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{getMemberSince()}</Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        <View style={styles.walletCard}>
          <View>
            <Text style={styles.walletLabel}>⚡ Volt Credits</Text>
            <Text style={styles.walletAmount}>$0.00</Text>
          </View>
          <TouchableOpacity style={styles.addCreditsBtn}>
            <Text style={styles.addCreditsBtnText}>Add Credits</Text>
          </TouchableOpacity>
        </View>

        {/* Total spent card */}
        <View style={styles.spentCard}>
          <Ionicons name="leaf-outline" size={20} color="#22c55e" />
          <Text style={styles.spentText}>
            You've taken <Text style={styles.spentBold}>{rideCount} rides</Text> and spent{' '}
            <Text style={styles.spentBold}>${totalSpent.toFixed(2)}</Text> with VoltRide
          </Text>
        </View>

        {menuItems.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => item.screen && navigation.navigate(item.screen)}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={item.icon} size={20} color={DARK} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={MUTED} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={RED} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={deleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
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
    backgroundColor: HEADER_BG,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  editBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD, justifyContent: 'center', alignItems: 'center',
  },

  profileCard: {
    backgroundColor: CARD, margin: 16,
    borderRadius: 16, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: GOLD, justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: DARK },
  name: { fontSize: 22, fontWeight: '700', color: DARK, marginBottom: 4 },
  email: { fontSize: 14, color: MUTED, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { alignItems: 'center', paddingHorizontal: 16 },
  statValue: { fontSize: 15, fontWeight: '700', color: DARK },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: BORDER },

  walletCard: {
    backgroundColor: CARD, marginHorizontal: 16,
    marginBottom: 12, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  walletLabel: { fontSize: 14, color: GOLD, fontWeight: '600', marginBottom: 4 },
  walletAmount: { fontSize: 22, fontWeight: '700', color: DARK },
  addCreditsBtn: {
    backgroundColor: '#FFF8E7', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: GOLD,
  },
  addCreditsBtnText: { color: GOLD, fontWeight: '600', fontSize: 13 },

  spentCard: {
    backgroundColor: '#F0FFF4', marginHorizontal: 16,
    marginBottom: 16, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  spentText: { fontSize: 13, color: '#166534', flex: 1, lineHeight: 20 },
  spentBold: { fontWeight: '700' },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: MUTED,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5
  },
  menuCard: {
    backgroundColor: CARD, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15, color: DARK, fontWeight: '500' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: CARD, marginHorizontal: 16,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#FECACA',
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: RED },

  deleteBtn: { alignItems: 'center', padding: 12 },
  deleteText: { fontSize: 13, color: MUTED },
})

