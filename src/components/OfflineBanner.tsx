/**
 * OfflineBanner.tsx
 * Banner que aparece no topo quando offline ou há itens pendentes.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../contexts/NetworkContext';

export function OfflineBanner() {
  const { online, pendentes, sincronizando, sincronizarAgora } = useNetwork();

  // Não mostrar nada se online e sem pendentes
  if (online && pendentes === 0) return null;

  return (
    <View style={[styles.banner, online ? styles.bannerPendente : styles.bannerOffline]}>
      <Ionicons
        name={online ? 'cloud-upload-outline' : 'cloud-offline-outline'}
        size={16}
        color="#fff"
      />
      <Text style={styles.texto}>
        {!online
          ? 'Sem conexão — dados salvos localmente'
          : `${pendentes} ${pendentes === 1 ? 'item pendente' : 'itens pendentes'} para sincronizar`}
      </Text>
      {online && pendentes > 0 && (
        <TouchableOpacity onPress={sincronizarAgora} disabled={sincronizando}>
          {sincronizando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.botao}>Sincronizar</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  bannerOffline: {
    backgroundColor: '#EF4444',
  },
  bannerPendente: {
    backgroundColor: '#F59E0B',
  },
  texto: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  botao: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
