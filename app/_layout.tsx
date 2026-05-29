import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <StatusBar style="light" backgroundColor="#0f1117" />
        <Stack screenOptions={{ headerShown: false }} />
      </NetworkProvider>
    </AuthProvider>
  );
}
