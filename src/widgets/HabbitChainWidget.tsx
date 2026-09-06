import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface ChainDayItem {
  dayLabel: string;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
  isPast: boolean;
}

export interface HabbitChainWidgetProps {
  habitId: string;
  habitName: string;
  habitColor: string;
  currentStreak: number;
  streakGoal: number;
  isCompletedToday: boolean;
  chainDays: ChainDayItem[];
}

export const HabbitChainWidget: React.FC<HabbitChainWidgetProps> = ({
  habitId,
  habitName,
  habitColor,
  currentStreak,
  streakGoal,
  isCompletedToday,
  chainDays,
}) => {
  const safeColor = (habitColor.startsWith('#') ? habitColor : '#10B981') as `#${string}`;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0A0E17',
        borderRadius: 24,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* 1. Üst Başlık ve Seri Göstergesi */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
          marginBottom: 8,
        }}
      >
        <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
          <TextWidget
            text="ZİNCİRİ KIRMA"
            style={{
              color: safeColor,
              fontSize: 10,
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          />
          <TextWidget
            text={habitName || 'Alışkanlık Zinciri'}
            maxLines={1}
            truncate="END"
            style={{
              color: '#F8FAFC',
              fontSize: 14,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>

        {/* Seri Rozeti */}
        <FlexWidget
          style={{
            backgroundColor: '#1E2433',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
        >
          <TextWidget
            text={`🔥 ${currentStreak} Gün`}
            style={{
              color: '#F59E0B',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* 2. Zincir Takvim Matrisi (Haftalık 7 Gün) */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#111722',
          paddingHorizontal: 8,
          paddingVertical: 10,
          borderRadius: 16,
          width: 'match_parent',
        }}
      >
        {chainDays.map((d, index) => {
          const isDone = d.isCompleted;
          const isToday = d.isToday;

          return (
            <FlexWidget
              key={d.dateStr || String(index)}
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              {/* Gün Harfi */}
              <TextWidget
                text={d.dayLabel}
                style={{
                  color: isToday ? '#38BDF8' : '#64748B',
                  fontSize: 10,
                  fontWeight: isToday ? 'bold' : 'normal',
                  marginBottom: 6,
                }}
              />

              {/* Gün Dairesi */}
              <FlexWidget
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: isDone
                    ? safeColor
                    : isToday
                    ? '#1E293B'
                    : '#161D2A',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                {...(isToday && habitId
                  ? {
                      clickAction: 'TOGGLE_HABIT',
                      clickActionData: { habitId },
                    }
                  : {})}
              >
                <TextWidget
                  text={isDone ? '✓' : isToday ? '+' : '•'}
                  style={{
                    color: isDone
                      ? '#080B10'
                      : isToday
                      ? '#38BDF8'
                      : '#475569',
                    fontSize: isDone || isToday ? 13 : 11,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                />
              </FlexWidget>
            </FlexWidget>
          );
        })}
      </FlexWidget>

      {/* 3. Alt Durum Bilgisi */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
          marginTop: 6,
        }}
      >
        <TextWidget
          text={
            isCompletedToday
              ? '✓ Bugün tamamlandı! Zincir korundu.'
              : '⚡ Bugün henüz yapılmadı. Zinciri koru!'
          }
          style={{
            color: isCompletedToday ? '#10B981' : '#94A3B8',
            fontSize: 10,
            fontWeight: isCompletedToday ? 'bold' : 'normal',
          }}
        />

        <TextWidget
          text={`Hedef: ${streakGoal} Gün`}
          style={{
            color: '#64748B',
            fontSize: 10,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
};
