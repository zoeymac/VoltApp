import { useState, useRef } from 'react'
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
const RED = '#ef4444'
const BLUE = '#3b82f6'

const ALL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'ride',
    icon: 'checkmark-circle',
    iconColor: GREEN,
    title: 'Ride Completed',
    body: 'Your ride to Union Station has been completed. Total: $12.00',
    time: '2 min ago',
    group: 'Today',
    read: false,
  },
  {
    id: 2,
    type: 'driver',
    icon: 'person-circle',
    iconColor: BLUE,
    title: 'Driver Assigned',
    body: 'Alex Chen is on the way in a Tesla Model 3. ETA: 4 min.',
    time: '1 hour ago',
    group: 'Today',
    read: false,
  },
  {
    id: 3,
    type: 'promo',
    icon: 'gift',
    iconColor: GREEN,
    title: 'You earned $5 credit!',
    body: 'Your friend signed up using your referral code. $5 has been added to your wallet.',
    time: '3 hours ago',
    group: 'Today',
    read: true,
  },
  {
    id: 4,
    type: 'payment',
    icon: 'card',
    iconColor: GOLD,
    title: 'Payment Successful',
    body: 'Payment of $18.00 processed for your Premium ride.',
    time: 'Yesterday',
    group: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    icon: 'flash',
    iconColor: GOLD,
    title: 'Welcome to VoltRide!',
    body: "Thanks for joining Toronto's first 100% electric ride-sharing platform.",
    time: '2 days ago',
    group: 'Earlier',
    read: true,
  },
]

const GROUP_ORDER = ['Today', 'Yesterday', 'Earlier']

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const dismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const grouped = GROUP_ORDER.map(group => ({
    group,
    items: notifications.filter(n => n.group === group)
  })).filter(g => g.items.length > 0)

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

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="notifications-off-outline" size={40} color={MUTED} />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyDesc}>No new notifications right now. We'll let you know when something comes in.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.emptyBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* UNREAD SUMMARY */}
          {unreadCount > 0 && (
            <View style={styles.summaryBanner}>
              <View style={styles.summaryLeft}>
                <Ionicons name="flash" size={16} color={GOLD} />
                <Text style={styles.summaryText}>
                  You have <Text style={styles.summaryBold}>{unreadCount} unread</Text> notification{unreadCount > 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.summaryAction}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* GROUPED NOTIFICATIONS */}
          {grouped.map(({ group, items }) => (
            <View key={group} style={styles.groupSection}>
              <Text style={styles.groupLabel}>{group}</Text>
              {items.map((notif, i) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notifCard,
                    !notif.read && styles.notifCardUnread,
                  ]}
                  onPress={() => markRead(notif.id)}
                  activeOpacity={0.8}
                >
                  {/* LEFT GOLD BAR for unread */}
                  {!notif.read && <View style={styles.unreadBar} />}

                  <View style={[styles.notifIconWrap, { backgroundColor: `${notif.iconColor}18` }]}>
                    <Ionicons name={notif.icon} size={24} color={notif.iconColor} />
                  </View>

                  <View style={styles.notifContent}>
                    <View style={styles.notifTop}>
                      <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                        {notif.title}
                      </Text>
                      <Text style={styles.notifTime}>{notif.time}</Text>
                    </View>
                    <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.dismissBtn}
                    onPress={() => dismiss(notif.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={16} color={MUTED} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* SETTINGS HINT */}
          <View style={styles.settingsHint}>
            <Ionicons name="settings-outline" size={16} color={MUTED} />
            <Text style={styles.settingsHintText}>
              Manage notification preferences in Settings
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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

  scroll: { padding: 16 },

  summaryBanner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8E7', borderRadius: 12,
    padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: '#F0E4B8',
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { fontSize: 13, color: DARK },
  summaryBold: { fontWeight: '700' },
  summaryAction: { fontSize: 13, color: GOLD, fontWeight: '700' },

  groupSection: { marginBottom: 24 },
  groupLabel: {
    fontSize: 12, fontWeight: '700', color: MUTED,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 10,
  },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: CARD, borderRadius: 16,
    padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
    borderWidth: 1, borderColor: BORDER,
  },
  notifCardUnread: {
    backgroundColor: '#FFFDF5',
    borderColor: '#F0E4B8',
  },
  unreadBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, backgroundColor: GOLD,
    borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
  },
  notifIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  notifTitle: { fontSize: 14, fontWeight: '600', color: DARK, flex: 1, marginRight: 8 },
  notifTitleUnread: { fontWeight: '800' },
  notifTime: { fontSize: 11, color: MUTED, flexShrink: 0 },
  notifBody: { fontSize: 13, color: MUTED, lineHeight: 19 },
  dismissBtn: {
    padding: 2, marginLeft: 8, flexShrink: 0,
  },

  settingsHint: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    padding: 16,
  },
  settingsHintText: { fontSize: 12, color: MUTED },

  emptyState: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', padding: 40,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: DARK, marginBottom: 8 },
  emptyDesc: {
    fontSize: 14, color: MUTED,
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  emptyBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: DARK },
})
