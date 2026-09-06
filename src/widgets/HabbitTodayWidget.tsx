import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface WidgetHabitItem {
  id: string;
  name: string;
  color: string;
  currentValue: number;
  targetValue: number;
  unit?: string;
  isCompleted: boolean;
  type: 'build' | 'quit';
}

export interface HabbitTodayWidgetProps {
  dateDisplay: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  habits: WidgetHabitItem[];
}

export const HabbitTodayWidget: React.FC<HabbitTodayWidgetProps> = ({
  dateDisplay,
  completedCount,
  totalCount,
  completionRate,
  habits,
}) => {
  const displayHabits = habits.slice(0, 4);

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
      {/* 1. Üst Bar: Başlık, Tarih ve İlerleme Özeti */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
          marginBottom: 8,
        }}
      >
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text="Ritim"
            style={{
              color: '#10B981',
              fontSize: 11,
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          />
          <TextWidget
            text={dateDisplay}
            style={{
              color: '#F1F5F9',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            backgroundColor: '#161D2A',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text={`${completedCount}/${totalCount} • %${completionRate}`}
            style={{
              color: completionRate === 100 ? '#10B981' : '#38BDF8',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* 2. Alışkanlık Listesi Satırları */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          width: 'match_parent',
          flexGap: 6,
          flex: 1,
        }}
      >
        {displayHabits.length === 0 ? (
          <FlexWidget
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
            }}
          >
            <TextWidget
              text="Bugün için planlanmış alışkanlık yok"
              style={{
                color: '#64748B',
                fontSize: 12,
                textAlign: 'center',
              }}
            />
          </FlexWidget>
        ) : (
          displayHabits.map((habit) => {
            const isDone = habit.isCompleted;
            const habitColor = habit.color || '#10B981';

            // İlerleme metni
            let progressText = '';
            if (habit.targetValue > 1 && habit.unit) {
              progressText = `${habit.currentValue}/${habit.targetValue} ${habit.unit}`;
            } else if (isDone) {
              progressText = 'Tamamlandı';
            } else {
              progressText = habit.type === 'quit' ? 'İhlal Yok' : 'Bekliyor';
            }

            return (
              <FlexWidget
                key={habit.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#111722',
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  borderRadius: 12,
                  width: 'match_parent',
                }}
              >
                {/* Sol: Renk Şeridi ve Alışkanlık Bilgisi */}
                <FlexWidget
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <FlexWidget
                    style={{
                      width: 4,
                      height: 24,
                      backgroundColor: (habitColor.startsWith('#') ? habitColor : '#10B981') as `#${string}`,
                      borderRadius: 2,
                      marginRight: 8,
                    }}
                  />
                  <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
                    <TextWidget
                      text={habit.name}
                      maxLines={1}
                      truncate="END"
                      style={{
                        color: isDone ? '#94A3B8' : '#F8FAFC',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
                    />
                    <TextWidget
                      text={progressText}
                      style={{
                        color: isDone ? '#10B981' : '#64748B',
                        fontSize: 10,
                      }}
                    />
                  </FlexWidget>
                </FlexWidget>

                {/* Sağ: İnteraktif Tamamlama Butonu */}
                <FlexWidget
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: isDone ? '#10B981' : '#1E293B',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8,
                  }}
                  clickAction="TOGGLE_HABIT"
                  clickActionData={{ habitId: habit.id }}
                >
                  <TextWidget
                    text={isDone ? '✓' : '+'}
                    style={{
                      color: isDone ? '#080B10' : '#38BDF8',
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  />
                </FlexWidget>
              </FlexWidget>
            );
          })
        )}
      </FlexWidget>
    </FlexWidget>
  );
};
