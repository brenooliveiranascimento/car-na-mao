import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { toSvgPaths } from '@/lib/geometry';
import { colors } from '@/lib/theme';

type Ring = [number, number][];

export interface Layer {
  rings: Ring[];
  color: string;
  fillOpacity?: number;
  dashed?: boolean;
  label: string;
}

/** Offline drawing of the property (declared vs walked vs overlaps). No map tiles needed. */
export function AreaPreview({ layers, size = 300 }: { layers: Layer[]; size?: number }) {
  const paths = toSvgPaths(layers.map((l) => l.rings), size);
  const description = layers.filter((l) => l.rings.length > 0).map((l) => l.label).join(', ');
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Desenho do imóvel mostrando: ${description}`}
      style={{ alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
    >
      <Svg width={size} height={size}>
        {layers.map((layer, i) =>
          paths[i] ? (
            <Path
              key={layer.label}
              d={paths[i]}
              stroke={layer.color}
              strokeWidth={3}
              strokeDasharray={layer.dashed ? '8,6' : undefined}
              fill={layer.color}
              fillOpacity={layer.fillOpacity ?? 0.12}
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
}
