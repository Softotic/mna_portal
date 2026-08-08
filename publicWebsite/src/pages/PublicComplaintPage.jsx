import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Attachment,
  DescriptionOutlined,
  Gavel,
  LocationOnOutlined,
  ManageSearch,
  PersonOutlineOutlined,
  ReceiptLong,
  Shield,
  Timeline,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import { publicComplaintsAPI, resolveMediaUrl } from '../api/index.js';

const complaintCategories = [
  'Community Issue',
  'Infrastructure',
  'Health & Safety',
  'Employment',
  'Education',
  'Utilities',
  'Law & Order',
  'Other',
];

const requiredComplaintFields = {
  name: 'Please enter your name.',
  father_name: "Please enter your father's name.",
  village: 'Please enter your village.',
  union_council: 'Please enter your union council.',
  cnic: 'Please enter your CNIC.',
  phone: 'Please enter your phone number.',
  category: 'Please select a complaint category.',
  description: 'Please describe the issue and the support you need.',
};

const processNotes = [
  {
    title: 'Receive a reference',
    body: 'A tracking number is issued as soon as the office receives your complaint.',
    icon: <ReceiptLong fontSize="small" />,
  },
  {
    title: 'Office review',
    body: 'The office reviews the details and records each change to the case status.',
    icon: <Shield fontSize="small" />,
  },
  {
    title: 'Follow progress',
    body: 'Use your tracking number or CNIC to see updates, remarks, and attachments.',
    icon: <Timeline fontSize="small" />,
  },
];

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data === 'string') return data;

  if (data && typeof data === 'object') {
    const firstError = Object.entries(data).find(([, value]) => value);
    if (firstError) {
      const [field, value] = firstError;
      const message = Array.isArray(value) ? value[0] : value;
      const fieldLabel = field.replace(/_/g, ' ');
      return `${fieldLabel.charAt(0).toUpperCase()}${fieldLabel.slice(1)}: ${message}`;
    }
  }

  return fallback;
}

function FormSectionHeader({ icon, title, body }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ lineHeight: 1.25 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>{body}</Typography>
      </Box>
    </Stack>
  );
}

function formatStatus(status) {
  return (status || 'submitted').replace(/_/g, ' ');
}

function fileLabel(value) {
  return value?.split('/').pop() || '';
}

function TrackingCard({ complaint }) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 },  }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(260px, 1fr)' },
            gap: 3,
          }}
        >
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="overline" color="secondary.main">
                  {complaint.category}
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5 }}>
                  {complaint.tracking_number}
                </Typography>
              </Box>
              <Chip
                label={formatStatus(complaint.status)}
                color="secondary"
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, textTransform: 'capitalize' }}
              />
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              {complaint.description}
            </Typography>
            {complaint.admin_remarks && (
              <Box sx={{ mt: 2.5, p: 2.2, borderRadius: 3, bgcolor: alpha('#1f5f46', 0.08) }}>
                <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                  Latest office remark
                </Typography>
                <Typography color="text.secondary">{complaint.admin_remarks}</Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Paper sx={{ p: 2.4, border: '1px solid rgba(16,36,27,0.08)', height: '100%' }}>
              <Typography variant="overline" color="secondary.main">
                Case Details
              </Typography>
              <Typography sx={{ mt: 1.1, fontWeight: 700 }}>
                Submitted {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'N/A'}
              </Typography>
              {complaint.admin_attachment && (
                <Typography
                  component="a"
                  href={resolveMediaUrl(complaint.admin_attachment)}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ display: 'inline-flex', mt: 1.6, color: 'primary.main', fontWeight: 700 }}
                >
                  Open attachment: {fileLabel(complaint.admin_attachment)}
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Case timeline
        </Typography>
        <Stack spacing={2}>
          {complaint.updates?.length ? (
            complaint.updates.map((update) => (
              <Paper key={update.id} sx={{ p: 2.4, border: '1px solid rgba(16,36,27,0.08)' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                    {formatStatus(update.status)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {update.created_at ? new Date(update.created_at).toLocaleString() : 'Logged update'}
                  </Typography>
                </Stack>
                {update.comment && (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {update.comment}
                  </Typography>
                )}
                {update.attachment && (
                  <Typography
                    component="a"
                    href={resolveMediaUrl(update.attachment)}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ display: 'inline-flex', mt: 1.3, color: 'primary.main', fontWeight: 700 }}
                  >
                    Open attachment: {fileLabel(update.attachment)}
                  </Typography>
                )}
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">
              No additional updates have been added yet.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PublicComplaintPage() {
  const { settings } = useOutletContext();
  const [form, setForm] = useState({
    name: '',
    father_name: '',
    village: '',
    union_council: '',
    cnic: '',
    department: '',
    phone: '',
    category: '',
    description: '',
    attachment: null,
  });
  const [trackingSearch, setTrackingSearch] = useState({ tracking_number: '', cnic: '' });
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [trackingError, setTrackingError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const trackingItems = useMemo(() => {
    if (!trackingResult) return [];
    return Array.isArray(trackingResult) ? trackingResult : [trackingResult];
  }, [trackingResult]);

  const updateFormValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateTrackingValue = (field, value) => {
    setTrackingSearch((prev) => ({ ...prev, [field]: value }));
    if (trackingError) setTrackingError('');
  };

  const hasFieldError = (field) => (
    submitAttempted && !String(form[field] ?? '').trim()
  );

  const fieldHelperText = (field, defaultText = 'Required') => (
    hasFieldError(field) ? requiredComplaintFields[field] : defaultText
  );

  const missingFieldCount = Object.keys(requiredComplaintFields).filter(
    (field) => !String(form[field] ?? '').trim(),
  ).length;
  const validationMessage = submitAttempted && missingFieldCount > 0
    ? `Please complete the ${missingFieldCount} highlighted required ${missingFieldCount === 1 ? 'field' : 'fields'}.`
    : '';
  const formError = validationMessage || submissionError;
  const officeName = String(settings?.leader_name || settings?.site_name || 'The constituency office')
    .replace(/^about\s+/i, '')
    .trim();

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setSubmitAttempted(true);
    setSubmissionError('');
    if (missingFieldCount > 0) return;

    setLoading(true);
    try {
      const response = await publicComplaintsAPI.create(form);
      setSubmissionStatus(response.data.tracking_number);
      setTrackingResult(response.data);
      setForm({
        name: '',
        father_name: '',
        village: '',
        union_council: '',
        cnic: '',
        department: '',
        phone: '',
        category: '',
        description: '',
        attachment: null,
      });
      setSubmitAttempted(false);
    } catch (err) {
      setSubmissionError(getApiErrorMessage(err, 'We could not submit your complaint. Please check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (event) => {
    event?.preventDefault();
    if (!trackingSearch.tracking_number && !trackingSearch.cnic) {
      setTrackingError('Enter a tracking number or CNIC to search.');
      return;
    }

    setTrackingLoading(true);
    setTrackingError('');
    try {
      const params = {};
      if (trackingSearch.tracking_number) params.tracking_number = trackingSearch.tracking_number;
      if (trackingSearch.cnic) params.cnic = trackingSearch.cnic;
      const response = await publicComplaintsAPI.track(params);
      setTrackingResult(response.data);
    } catch (err) {
      setTrackingResult(null);
      setTrackingError(getApiErrorMessage(err, 'We could not find a matching complaint. Check the details and try again.'));
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <Box sx={{ pb: { xs: 6, md: 9 } }}>
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(340px, 0.75fr)' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="overline" color="primary.main">
                Citizen complaint portal
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mt: 1.2,
                  maxWidth: 780,
                  fontSize: { xs: '2.45rem', sm: '3.15rem', md: '3.65rem', xl: '4rem' },
                  lineHeight: 1.04,
                }}
              >
                Report an issue. Track what happens next.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2.2, maxWidth: 650, fontSize: { md: '1.05rem' } }}>
                {officeName} records complaints, issues a tracking number, and keeps citizens informed as each case moves forward.
              </Typography>
            </Box>

            <Paper
              component="form"
              noValidate
              onSubmit={handleTrack}
              sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider' }}
            >
              <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.14),
                    color: 'secondary.dark',
                  }}
                >
                  <ManageSearch fontSize="small" />
                </Box>
                <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>Track a complaint</Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2.25 }}>
                Enter either your tracking number or CNIC.
              </Typography>
              {trackingError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {trackingError}
                </Alert>
              )}
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Tracking number"
                  placeholder="e.g. CMP-12AB34CD"
                  value={trackingSearch.tracking_number}
                  onChange={(event) => updateTrackingValue('tracking_number', event.target.value)}
                />
                <TextField
                  fullWidth
                  label="CNIC"
                  placeholder="e.g. 42101-1234567-1"
                  value={trackingSearch.cnic}
                  onChange={(event) => updateTrackingValue('cnic', event.target.value)}
                  slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={trackingLoading}>
                  {trackingLoading ? 'Searching...' : 'Find complaint'}
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Box>

      <Container sx={{ pt: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
            gap: { xs: 4, md: 5 },
            alignItems: 'start',
          }}
        >
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4.5 } }}>
              <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.35rem' }, mb: 1.2 }}>
                Submit a complaint
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                Share enough detail for the office to understand the issue, contact you, and direct the case to the right department.
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Fields marked with an asterisk (*) are required.
              </Typography>

              {formError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {formError}
                </Alert>
              )}
              {submissionStatus && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  Complaint submitted. Your tracking number is <strong>{submissionStatus}</strong>. Keep it for future updates.
                </Alert>
              )}

              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 4 }}>
                <Box component="section">
                  <FormSectionHeader
                    icon={<PersonOutlineOutlined fontSize="small" />}
                    title="Your identity"
                    body="Tell us who is submitting the complaint."
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
                    <TextField
                      required
                      fullWidth
                      label="Name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={(event) => updateFormValue('name', event.target.value)}
                      error={hasFieldError('name')}
                      helperText={fieldHelperText('name')}
                    />
                    <TextField
                      required
                      fullWidth
                      label="Father's name"
                      placeholder="Enter your father's full name"
                      value={form.father_name}
                      onChange={(event) => updateFormValue('father_name', event.target.value)}
                      error={hasFieldError('father_name')}
                      helperText={fieldHelperText('father_name')}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box component="section">
                  <FormSectionHeader
                    icon={<LocationOnOutlined fontSize="small" />}
                    title="Location and contact"
                    body="Help the office identify the area and contact you about the case."
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
                    <TextField
                      required
                      fullWidth
                      label="Village"
                      placeholder="Enter your village name"
                      value={form.village}
                      onChange={(event) => updateFormValue('village', event.target.value)}
                      error={hasFieldError('village')}
                      helperText={fieldHelperText('village')}
                    />
                    <TextField
                      required
                      fullWidth
                      label="Union council"
                      placeholder="Enter your union council"
                      value={form.union_council}
                      onChange={(event) => updateFormValue('union_council', event.target.value)}
                      error={hasFieldError('union_council')}
                      helperText={fieldHelperText('union_council')}
                    />
                    <TextField
                      required
                      fullWidth
                      label="CNIC"
                      placeholder="e.g. 42101-1234567-1"
                      value={form.cnic}
                      onChange={(event) => updateFormValue('cnic', event.target.value)}
                      error={hasFieldError('cnic')}
                      helperText={fieldHelperText('cnic', 'Include digits and dashes as shown.')}
                      slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                    />
                    <TextField
                      fullWidth
                      label="Department (optional)"
                      placeholder="e.g. Education Department"
                      value={form.department}
                      onChange={(event) => updateFormValue('department', event.target.value)}
                      helperText="Add this if you know which department is responsible."
                    />
                    <TextField
                      required
                      fullWidth
                      label="Phone number"
                      placeholder="e.g. 0300 1234567"
                      value={form.phone}
                      onChange={(event) => updateFormValue('phone', event.target.value)}
                      error={hasFieldError('phone')}
                      helperText={fieldHelperText('phone', 'Use a number where the office can reach you.')}
                      slotProps={{ htmlInput: { inputMode: 'tel' } }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box component="section">
                  <FormSectionHeader
                    icon={<DescriptionOutlined fontSize="small" />}
                    title="Complaint details"
                    body="Explain what happened and what support you need."
                  />
                  <Stack spacing={2.5}>
                    <TextField
                      required
                      select
                      fullWidth
                      label="Category"
                      value={form.category}
                      onChange={(event) => updateFormValue('category', event.target.value)}
                      error={hasFieldError('category')}
                      helperText={fieldHelperText('category', 'Choose the category that best matches the issue.')}
                    >
                      <MenuItem value="" disabled>Select a category</MenuItem>
                      {complaintCategories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      required
                      fullWidth
                      label="Description"
                      placeholder="Describe the location, what happened, and the support you need."
                      multiline
                      rows={6}
                      value={form.description}
                      onChange={(event) => updateFormValue('description', event.target.value)}
                      error={hasFieldError('description')}
                      helperText={fieldHelperText('description', 'Include the location, nature of the issue, and support required.')}
                    />
                    <Box
                      sx={{
                        p: 2.25,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
                      }}
                    >
                      <Button variant="outlined" component="label" startIcon={<Attachment />}>
                        Attach image, PDF, or video
                        <input
                          type="file"
                          hidden
                          accept="image/*,application/pdf,video/*"
                          onChange={(event) => updateFormValue('attachment', event.target.files?.[0] || null)}
                        />
                      </Button>
                      <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                        {form.attachment ? `Selected file: ${form.attachment.name}` : 'Optional. A supporting file can help the office understand the issue.'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, alignItems: { sm: 'center' } }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{ minWidth: { sm: 220 } }}
                  >
                    {loading ? 'Submitting...' : 'Submit complaint'}
                  </Button>
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                    <Shield sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2">Your details are used only to review and follow up on this case.</Typography>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
            <Paper sx={{ p: { xs: 2.5, md: 3.25 }, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" sx={{ mb: 0.8 }}>What happens next</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2.5 }}>
                Your complaint stays connected to one trackable case.
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={2.25}>
                {processNotes.map((note) => (
                  <Stack key={note.title} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.14),
                        color: 'secondary.dark',
                        flexShrink: 0,
                      }}
                    >
                      {note.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.35 }}>{note.title}</Typography>
                      <Typography color="text.secondary" variant="body2" sx={{ mt: 0.45 }}>{note.body}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
              <Gavel sx={{ color: 'secondary.light', mb: 1.5 }} />
              <Typography variant="h6" sx={{ color: 'inherit', mb: 1 }}>A clear public record</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(248,251,249,0.82)' }}>
                A formal case record keeps requests documented, progress visible, and follow-up accountable.
              </Typography>
            </Paper>
          </Stack>
        </Box>

        {trackingItems.length > 0 && (
          <Box component="section" sx={{ mt: { xs: 6, md: 8 } }}>
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.35rem' }, mb: 1 }}>
              Complaint status and history
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Review the latest status, office remarks, and case updates.
            </Typography>
            <Stack spacing={3}>
              {trackingItems.map((complaint) => (
                <TrackingCard key={complaint.id} complaint={complaint} />
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
