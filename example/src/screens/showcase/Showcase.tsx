import React, { useMemo } from 'react';
import { default as ShowcaseTemplate } from '@gorhom/showcase-template';
import { useNavigation } from '@react-navigation/native';
import { useSafeArea } from 'react-native-safe-area-context';
import { version, description } from '../../../../package.json';
// import { Header } from './Header';
import { useAppContext } from '../../hooks/useAppContext';

const data = [
  {
    title: 'Picker',
    data: [
      {
        name: 'Time Picker',
        slug: 'TimePicker'
      },
      {
        name: 'Card Picker',
        slug: 'CardPicker'
      }
    ]
  },
  {
    title: 'Selection Mode',
    data: [
      {
        name: 'Single Day',
        slug: 'SingleDaySelectionMode'
      },
      {
        name: 'Multiple Days',
        slug: 'MultipleDaysSelectionMode'
      }
    ]
  },
  {
    title: 'Scroll Mode',
    data: [
      {
        name: 'One Month',
        slug: 'OneMonthScrollMode'
      },
      {
        name: 'Multiple Months',
        slug: 'MultipleMonthsScrollMode'
      },
      {
        name: 'Any Offset',
        slug: 'AnyOffsetScrollMode'
      }
    ]
  },
  {
    title: 'Integrations',
    data: [
      {
        name: 'Modal BottomSheet',
        slug: 'ModalBottomSheet'
      }
    ]
  }
];

export const Showcase = () => {
  // hooks
  const { navigate } = useNavigation();
  const { theme } = useAppContext();
  const safeInsets = useSafeArea();
  console.log(`Showcase: theme is ${theme}`);

  // variables
  const author = useMemo(
    () => ({
      username: 'Victor Malov',
      url: 'https://github.com/breeffy/react-native-calendar'
    }),
    []
  );

  // callbacks
  const handleOnPress = (slug: string) => navigate(slug);

  // renders
  return (
    <>
      <ShowcaseTemplate
        theme={theme}
        version={version}
        name="Calendar"
        description={description}
        author={author}
        data={data}
        safeInsets={safeInsets}
        handleOnPress={handleOnPress}
      />
    </>
  );
};
