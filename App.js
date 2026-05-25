import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from './lib/supabase'

import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'
import HomeScreen from './screens/HomeScreen'
import RideScreen from './screens/RideScreen'
import DriverScreen from './screens/DriverScreen'
import ProfileScreen from './screens/ProfileScreen'
import RideHistoryScreen from './screens/RideHistoryScreen'
import ChargingStationsScreen from './screens/ChargingStationsScreen'
import NotificationsScreen from './screens/NotificationsScreen'

const Stack = createStackNavigator()

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Ride" component={RideScreen} />
      <Stack.Screen name="Driver" component={DriverScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      <Stack.Screen name="ChargingStations" component={ChargingStationsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDFAF3' }}>
        <ActivityIndicator size="large" color="#E8C468" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {session ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

