import { useState, useEffect, useRef } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, Platform, StatusBar
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#E8C468'
const CREAM = '#FDFAF3'
const CARD = '#FFFFFF'
const MUTED = '#999999'
const DARK = '#1A1A1A'
const BORDER = '#E8E8E8'
const GREEN = '#22c55e'

const mockNotifications = [
  {
    id: 1,
    type: 'ride_update',
    icon: 'car-outline',
    iconColor: GOLD,
    title: 'Ride Completed',
    body: 'Your ride to Union Station has been completed. Total: $12.00',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'driver_assigned',
    icon: 'person-outline',
    iconColor: '#3b82f6',
    title: 'Driver Assigned',
    body: 'Alex Chen is on the way in a Tesla Model 3. ETA: 4 min.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'promo',
    icon: 'gift-outline',
    iconColor: GREEN,
    title: 'You earned $5 credit!',
    body: 'Your friend signed up using your referral code. $5 has been added to your wallet.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'payment',
    icon: 'card-outline',
    iconColor: GOLD,
    title: 'Payment Successful',
    body: 'Payment of $18.00 processed for your Premium ride.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    icon: 'flash-outline',
    iconColor: GOLD,
    title: 'Welcome to VoltRide!',
    body: 'Thanks for joining Toronto\'s first 100% electric ride-sharing platform.',
    time: '2 days ago',
    read: true,
  },
]

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [loading, setLoading] = useState(true)
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start()
    setTimeout(() => setLoading(false), 800)
  }, [])

  const skeletonOpacity = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1]
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
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
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.listContainer}>
            {[1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.skeletonCard, { opacity: skeletonOpacity }]} />
            ))}
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={48} color={MUTED} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDesc}>You're all caught up!</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {notifications.map((notif, i) => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                onPress={() => markRead(notif.id)}
              >
                <View style={[styles.notifIconWrap, { backgroundColor: `${notif.iconColor}22` }]}>
                  <Ionicons name={notif.icon} size={22} color={notif.iconColor} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTop}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                  <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  unreadBadge: {
    backgroundColor: GOLD, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  unreadBadgeText: { fontSize: 12, fontWeight: '700', color: DARK },
  markAllText: { fontSize: 13, color: DARK, fontWeight: '600' },

  listContainer: { padding: 16, gap: 10 },

  notifCard: {
    backgroundColor: CARD, borderRadius: 14,
    padding: 14, flexDirection: 'row',
    alignItems: 'flex-start', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  notifCardUnread: {
    backgroundColor: '#FFFBF0',
    borderWidth: 1, borderColor: '#F0E4B8',
  },
  notifIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  notifTitle: { fontSize: 14, fontWeight: '700', color: DARK, flex: 1, marginRight: 8 },
  notifTime: { fontSize: 11, color: MUTED, flexShrink: 0 },
  notifBody: { fontSize: 13, color: MUTED, lineHeight: 18 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: GOLD, flexShrink: 0, marginTop: 4,
  },

  emptyState: { alignItems: 'center', padding: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: MUTED },

  skeletonCard: {
    height: 80, backgroundColor: '#E8E8E8',
    borderRadius: 14,
  },
})

