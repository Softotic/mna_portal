export const DEFAULT_SCHEME_STATUS = 'announced_not_started';

export const SCHEME_STATUS_OPTIONS = [
  {
    value: DEFAULT_SCHEME_STATUS,
    label: 'Announced but not started',
    color: '#808080',
    textColor: '#465057',
    backgroundColor: 'rgba(128, 128, 128, 0.13)',
    rowBackgroundColor: '#E6E6E6',
    rowHoverColor: '#DCDCDC',
  },
  {
    value: 'in_progress',
    label: 'In progress',
    color: '#E6A23C',
    textColor: '#704500',
    backgroundColor: 'rgba(230, 162, 60, 0.16)',
    rowBackgroundColor: '#FAEBD4',
    rowHoverColor: '#F8E3C5',
  },
  {
    value: 'completed_to_be_inaugurated',
    label: 'Completed – to be inaugurated',
    color: '#8E44AD',
    textColor: '#64297C',
    backgroundColor: 'rgba(142, 68, 173, 0.13)',
    rowBackgroundColor: '#EDE1F2',
    rowHoverColor: '#E4D2EB',
  },
  {
    value: 'completed_inaugurated',
    label: 'Completed and inaugurated',
    color: '#27AE60',
    textColor: '#17663D',
    backgroundColor: 'rgba(39, 174, 96, 0.13)',
    rowBackgroundColor: '#D8F0E2',
    rowHoverColor: '#C9EAD7',
  },
];

const STATUS_BY_VALUE = Object.fromEntries(
  SCHEME_STATUS_OPTIONS.map((status) => [status.value, status]),
);

export function getSchemeStatus(status) {
  return STATUS_BY_VALUE[status] || STATUS_BY_VALUE[DEFAULT_SCHEME_STATUS];
}
