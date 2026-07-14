import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useAppTheme } from '../ui/theme';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Library: { active: 'library', inactive: 'library-outline' },
  Browse: { active: 'globe', inactive: 'globe-outline' },
  History: { active: 'time', inactive: 'time-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

const CAPSULE_HEIGHT = 56;
const INDICATOR_INSET = 4;

// Mirrors iOS 26's floating "Liquid Glass" tab bar shape (see Aidoku's
// TabBarController.swift, the UITab/UISearchTab split): a capsule holding
// the fixed tabs, with search broken out into its own floating circular
// button beside it, instead of one full-width bar.
//
// The selected tab also gets a glass pill that slides to it on switch — an
// approximation of iOS 26's interactive drag-following highlight. The real
// thing tracks your finger continuously and refracts light (an OS
// compositor effect); this animates on press instead, since there's no way
// to reproduce live glass refraction in React Native.
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tint = scheme === 'dark' ? 'dark' : 'light';

  const mainRoutes = state.routes.filter((route) => route.name !== 'Search');
  const searchRoute = state.routes.find((route) => route.name === 'Search');
  const focusedRoute = state.routes[state.index];
  const focusedMainIndex = mainRoutes.findIndex((route) => route.key === focusedRoute.key);

  const itemLayouts = useRef<({ x: number; width: number } | undefined)[]>([]);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const target = itemLayouts.current[focusedMainIndex];
    if (!target) return;
    Animated.parallel([
      Animated.spring(indicatorX, { toValue: target.x, useNativeDriver: false, bounciness: 6 }),
      Animated.spring(indicatorWidth, { toValue: target.width, useNativeDriver: false, bounciness: 6 }),
    ]).start();
  }, [focusedMainIndex, indicatorX, indicatorWidth]);

  const onItemLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    itemLayouts.current[index] = { x, width };
    if (index === focusedMainIndex && !ready) {
      indicatorX.setValue(x);
      indicatorWidth.setValue(width);
      setReady(true);
    }
  };

  const go = (routeKey: string, routeName: string, isFocused: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + spacing.sm }]} pointerEvents="box-none">
      <View style={[styles.capsule, { borderColor: colors.border }]}>
        <BlurView intensity={80} tint={tint} style={StyleSheet.absoluteFill} />

        {ready && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              { transform: [{ translateX: indicatorX }], width: indicatorWidth, borderColor: colors.border },
            ]}
          >
            <BlurView intensity={100} tint={tint} style={StyleSheet.absoluteFill} />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.textPrimary, opacity: scheme === 'dark' ? 0.14 : 0.06 },
              ]}
            />
          </Animated.View>
        )}

        {mainRoutes.map((route, index) => {
          const isFocused = route.key === focusedRoute.key;
          const icon = ICONS[route.name];
          const badge = descriptors[route.key].options.tabBarBadge;

          return (
            <Pressable
              key={route.key}
              style={styles.tabItem}
              onLayout={onItemLayout(index)}
              onPress={() => go(route.key, route.name, isFocused)}
            >
              <View>
                <Ionicons
                  name={isFocused ? icon.active : icon.inactive}
                  size={22}
                  color={isFocused ? colors.accent : colors.textSecondary}
                />
                {badge != null && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color: isFocused ? colors.accent : colors.textSecondary }]}>
                {route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {searchRoute && (
        <Pressable
          style={[styles.searchBubble, { borderColor: colors.border }]}
          onPress={() => go(searchRoute.key, searchRoute.name, false)}
        >
          <BlurView intensity={80} tint={tint} style={StyleSheet.absoluteFill} />
          <Ionicons name="search" size={20} color={colors.textPrimary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  capsule: {
    flexDirection: 'row',
    height: CAPSULE_HEIGHT,
    borderRadius: CAPSULE_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
  },
  indicator: {
    position: 'absolute',
    top: INDICATOR_INSET,
    bottom: INDICATOR_INSET,
    left: 0,
    borderRadius: (CAPSULE_HEIGHT - INDICATOR_INSET * 2) / 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: spacing.md },
  label: { fontSize: 10, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  searchBubble: {
    width: CAPSULE_HEIGHT,
    height: CAPSULE_HEIGHT,
    borderRadius: CAPSULE_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
