import { useState } from 'react'
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, StatusBar, Platform,
  ActivityIndicator, KeyboardAvoidingView
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
const GREEN = '#22c55e'

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const sendReset = async () => {
    if (!email.trim()) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'voltride://reset-password' }
      )
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successIcon}>
          <Ionicons name="mail" size={48} color={CARD} />
        </View>
        <Text style={styles.successTitle}>Check your email</Text>
        <Text style={styles.successDesc}>
          We sent a password reset link to{'\n'}{email}
        </Text>
        <TouchableOpacity
          style={styles.backToLoginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backToLoginText}>Back to Sign In</Text>
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

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Ionicons name="lock-open-outline" size={48} color={GOLD} />
        </View>

        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          No worries — enter your email and we'll send you a reset link.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color={MUTED} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={MUTED}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, loading && { opacity: 0.7 }]}
          onPress={sendReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={DARK} />
          ) : (
            <Text style={styles.resetBtnText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.cancelBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  content: {
    flex: 1, padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD, justifyContent: 'center',
    alignItems: 'center', marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },

  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, alignSelf: 'center',
  },

  title: { fontSize: 28, fontWeight: '800', color: DARK, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 24, marginBottom: 32 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 10,
    padding: 12, marginBottom: 16, gap: 8,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { fontSize: 13, color: RED, flex: 1 },

  inputWrap: { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: DARK, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: DARK },

  resetBtn: {
    backgroundColor: GOLD, borderRadius: 14,
    padding: 18, alignItems: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    marginBottom: 16,
  },
  resetBtnText: { fontSize: 17, fontWeight: '700', color: DARK },

  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { fontSize: 15, color: MUTED, fontWeight: '500' },

  successContainer: {
    flex: 1, backgroundColor: CREAM,
    alignItems: 'center', justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: GOLD, justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 12 },
  successDesc: {
    fontSize: 15, color: MUTED, textAlign: 'center',
    lineHeight: 24, marginBottom: 32,
  },
  backToLoginBtn: {
    backgroundColor: DARK, borderRadius: 14,
    padding: 18, alignItems: 'center', width: '100%',
  },
  backToLoginText: { fontSize: 17, fontWeight: '700', color: GOLD },
})

