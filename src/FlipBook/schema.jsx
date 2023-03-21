import { defineMessages } from 'react-intl';

const messages = defineMessages({
  source: {
    id: 'Source',
    defaultMessage: 'Source',
  },
  single_page: {
    id: 'single_page',
    defaultMessage: 'Mostra solo una pagina a volte',
  },
  play_speed: {
    id: 'play_speed',
    defaultMessage: 'Velocità riproduzione',
  },
});

export function FlipBookSchema({ formData, intl }) {
  return {
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [...(formData.url ? ['url'] : [])],
      },
      ...(formData.url
        ? [
            {
              id: 'settings',
              title: 'Settings',
              fields: ['singlePage', 'playSpeed'],
            },
          ]
        : []),
    ],
    properties: {
      url: {
        title: intl.formatMessage(messages.source),
        widget: 'url',
      },
      singlePage: {
        title: intl.formatMessage(messages.single_page),
        type: 'boolean',
      },
      playSpeed: {
        title: intl.formatMessage(messages.play_speed),
        type: 'number',
        default: 5,
        description: 'Tempo misurato in secondi',
      },
    },
    required: [],
  };
}
