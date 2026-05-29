import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/lib/theme';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.orange} size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (user.tipo === 'montador') return <Redirect href="/(montador)/home" />;
  if (user.tipo === 'entregador') return <Redirect href="/(entregador)/home" />;

  // admin ou cliente — redireciona pro montador por padrão (admin pode ver tudo)
  return <Redirect href="/(montador)/home" />;
}
