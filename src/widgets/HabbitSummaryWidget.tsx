import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface HabbitSummaryWidgetProps {
  completionRate: number;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
}

export const HabbitSummaryWidget: React.FC<HabbitSummaryWidgetProps> = ({
  completionRate,
  completedCount,
  totalCount,
  remainingCount,
}) => {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0A0E17',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      {/* Üst Logo */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="Ritim"
          style={{
            color: '#10B981',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        />
        <TextWidget
          text="BUGÜN"
          style={{
            color: '#64748B',
            fontSize: 10,
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>

      {/* Orta: Büyük Yüzde */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 4,
        }}
      >
        <TextWidget
          text={`%${completionRate}`}
          style={{
            color: completionRate === 100 ? '#10B981' : '#38BDF8',
            fontSize: 36,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        />
        <TextWidget
          text={`${completedCount} / ${totalCount} tamamlandı`}
          style={{
            color: '#94A3B8',
            fontSize: 12,
            fontWeight: '500',
            textAlign: 'center',
            marginTop: 2,
          }}
        />
      </FlexWidget>

      {/* Alt Durum Çubuğu */}
      <FlexWidget
        style={{
          backgroundColor: '#161D2A',
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 10,
          width: 'match_parent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={
            remainingCount === 0 && totalCount > 0
              ? 'Tümü bitti! 🎉'
              : `${remainingCount} alışkanlık kaldı`
          }
          style={{
            color: remainingCount === 0 ? '#10B981' : '#E2E8F0',
            fontSize: 11,
            fontWeight: '600',
            textAlign: 'center',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
};
