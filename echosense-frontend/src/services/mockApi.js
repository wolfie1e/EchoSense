// Mock data to simulate a live backend for demonstration

export const mockStats = {
  totalMentions: 1428,
  positive: 68,
  negative: 12,
  neutral: 20,
};

export const mockFeed = [
  { id: 1, source: 'Reddit', sentiment: 'positive', text: 'The new update is absolutely fantastic! Game changer.', language: 'en' },
  { id: 2, source: 'News', sentiment: 'neutral', text: 'Analysts are watching the company\'s next move closely.', language: 'en' },
  { id: 3, source: 'YouTube', sentiment: 'negative', text: 'I\'m so disappointed with the latest release, it\'s full of bugs.', language: 'en' },
  { id: 4, source: 'Reddit', sentiment: 'positive', text: 'Customer service was incredibly helpful today.', language: 'en' },
  { id: 5, source: 'Twitter', sentiment: 'positive', text: 'El nuevo producto es increíble, me encanta!', language: 'es' },
  { id: 6, source: 'News', sentiment: 'neutral', text: 'Le nouveau produit sera lancé le mois prochain.', language: 'fr' },
  { id: 7, source: 'Reddit', sentiment: 'negative', text: 'Das neue Update ist schrecklich, viele Bugs.', language: 'de' },
];

export const mockChartData = {
  labels: ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h', 'Now'],
  datasets: [
    {
      label: 'Positive',
      data: [22, 25, 30, 35, 40, 45, 52],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Negative',
      data: [10, 8, 12, 9, 11, 7, 5],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
};

export const mockAiResponses = [
    {id: 1, response: "Generated a response for a negative YouTube comment about bugs."},
    {id: 2, response: "Drafted a proactive statement addressing pricing concerns on Reddit."},
];
