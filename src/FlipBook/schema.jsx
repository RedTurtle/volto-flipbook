import { defineMessages } from 'react-intl';

const messages = defineMessages({
  Source: {
    id: 'Source',
    defaultMessage: 'Source',
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
        title: intl.formatMessage(messages.Source),
        widget: 'url',
      },
      singlePage: {
        title: 'Single page',
        type: 'boolean',
      },
      playSpeed: {
        title: 'play speed',
        type: 'number',
        default: 5,
      },
    },
    required: [],
  };
}
