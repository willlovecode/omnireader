import { useCallback, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

interface Props {
  value: number;
  maximum: number;
  onChange: (index: number) => void;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
}

// @react-native-community/slider's thumb can only be recolored, not
// resized (no size prop, and thumbImage needs a bundled asset) — its
// default thumb read as too thick for this reader. Hand-rolled instead:
// full control over thumb size, no extra native dependency.
const THUMB_SIZE = 12;
const TRACK_HEIGHT = 3;
const TOUCH_AREA_HEIGHT = 32;

export function PageSlider({ value, maximum, onChange, trackColor, fillColor, thumbColor }: Props) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const maximumRef = useRef(maximum);
  const onChangeRef = useRef(onChange);
  widthRef.current = width;
  maximumRef.current = maximum;
  onChangeRef.current = onChange;

  const updateFromX = useCallback((x: number) => {
    const trackWidth = widthRef.current;
    const max = maximumRef.current;
    if (trackWidth <= 0 || max <= 0) return;
    const ratio = Math.min(1, Math.max(0, x / trackWidth));
    onChangeRef.current(Math.round(ratio * max));
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateFromX(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => updateFromX(evt.nativeEvent.locationX),
    }),
  ).current;

  const ratio = maximum > 0 ? Math.min(1, Math.max(0, value / maximum)) : 0;

  return (
    <View
      style={styles.touchArea}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      hitSlop={{ top: 12, bottom: 12 }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: fillColor }]} />
      </View>
      <View
        style={[
          styles.thumb,
          { backgroundColor: thumbColor, left: `${ratio * 100}%`, marginLeft: -THUMB_SIZE / 2 },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: { height: TOUCH_AREA_HEIGHT, justifyContent: 'center' },
  track: { height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, overflow: 'hidden' },
  fill: { height: '100%' },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
});
