import { Pressable, Text, View } from 'react-native';
import { questionCounts, studyActions, supportsQuestionCount } from '../../constants/studyActions';
import type { Action } from '../../types/study';
import { styles } from './styles';
type Props = {
  action: Action;
  count: number;
  disabled: boolean;
  onActionChange: (action: Action) => void;
  onCountChange: (count: number) => void;
};
export function ActionSelector({ action, count, disabled, onActionChange, onCountChange }: Props) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.title}>
        Tipo de atividade
      </Text>
      <View style={styles.grid}>
        {studyActions.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityState={{ selected: action === item.id, disabled }}
            disabled={disabled}
            onPress={() => onActionChange(item.id)}
            style={[
              styles.action,
              action === item.id && styles.selected,
              disabled && styles.disabled,
            ]}
          >
            <Text style={[styles.actionTitle, action === item.id && styles.selectedText]}>
              {item.title}
            </Text>
            <Text style={styles.description}>{item.description}</Text>
          </Pressable>
        ))}
      </View>
      {supportsQuestionCount(action) && (
        <View style={styles.countRow}>
          <Text style={styles.label}>Quantidade de perguntas</Text>
          <View style={styles.countOptions}>
            {questionCounts.map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} perguntas`}
                accessibilityState={{ selected: count === value, disabled }}
                disabled={disabled}
                onPress={() => onCountChange(value)}
                style={[
                  styles.count,
                  count === value && styles.selected,
                  disabled && styles.disabled,
                ]}
              >
                <Text style={styles.label}>{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
