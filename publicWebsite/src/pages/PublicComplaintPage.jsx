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
import { Attachment, Gavel, ManageSearch, ReceiptLong, Shield, Timeline } from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import { publicComplaintsAPI } from '../api/index.js';

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

const processNotes = [
  {
    title: 'Verified submission',
    body: 'Every complaint captures citizen identity, category, case details, and optional supporting files.',
    icon: <Shield fontSize="small" />,
  },
  {
    title: 'Trackable reference',
    body: 'A complaint number is issued immediately so the case can be followed clearly from submission onward.',
    icon: <ReceiptLong fontSize="small" />,
  },
  {
    title: 'Visible progress',
    body: 'Office remarks, status changes, and attachments can be reviewed from the public tracking interface.',
    icon: <Timeline fontSize="small" />,
  },
];

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
                  href={complaint.admin_attachment}
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
                    href={update.attachment}
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
  const [error, setError] = useState('');

  const trackingItems = useMemo(() => {
    if (!trackingResult) return [];
    return Array.isArray(trackingResult) ? trackingResult : [trackingResult];
  }, [trackingResult]);

  const updateFormValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.father_name || !form.village || !form.union_council || !form.cnic || !form.phone || !form.category || !form.description) {
      setError('Please complete all required fields before submitting the complaint.');
      return;
    }

    setLoading(true);
    setError('');
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
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Unable to submit complaint right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async () => {
    if (!trackingSearch.tracking_number && !trackingSearch.cnic) {
      setError('Enter a tracking number or CNIC to search.');
      return;
    }

    setTrackingLoading(true);
    setError('');
    try {
      const params = {};
      if (trackingSearch.tracking_number) params.tracking_number = trackingSearch.tracking_number;
      if (trackingSearch.cnic) params.cnic = trackingSearch.cnic;
      const response = await publicComplaintsAPI.track(params);
      setTrackingResult(response.data);
    } catch (err) {
      console.error(err);
      setTrackingResult(null);
      setError(err.response?.data?.detail || 'Unable to locate a matching complaint.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <Box sx={{ pb: { xs: 6, md: 9 }, px: { xs: 3, md: 6 } }}>
      <Container sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 4, md: 8 },  }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(320px, 420px)' },
            gap: { xs: 3, md: 5 },
            alignItems: 'start',
          }}
        >
          <Box>
            <Typography variant="overline" color="secondary.main">
              Citizen Complaint Portal
            </Typography>
            <Typography variant="h2" sx={{ mt: 1.2, maxWidth: 820 }}>
              A formal channel for complaints, service requests, and transparent follow-up
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2.4, maxWidth: 760 }}>
              {settings?.leader_name || settings?.site_name || 'This office'} provides a structured complaint system so citizens can raise issues formally, submit supporting material, and monitor progress through a dedicated tracking interface.
            </Typography>
          </Box>

          <Box>
            <Paper sx={{ p: 3.2, border: '1px solid rgba(16,36,27,0.08)' }}>
              <Typography variant="h6" sx={{ mb: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ManageSearch fontSize="small" color="secondary" />
                Track a complaint
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                Search one case by complaint number or all cases by CNIC.
              </Typography>
              <TextField
                fullWidth
                label="Tracking Number"
                value={trackingSearch.tracking_number}
                onChange={(event) => setTrackingSearch((prev) => ({ ...prev, tracking_number: event.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="CNIC"
                value={trackingSearch.cnic}
                onChange={(event) => setTrackingSearch((prev) => ({ ...prev, cnic: event.target.value }))}
                sx={{ mb: 2.5 }}
              />
              <Button onClick={handleTrack} variant="contained" color="secondary" fullWidth disabled={trackingLoading}>
                {trackingLoading ? 'Searching...' : 'Track Complaint'}
              </Button>
            </Paper>
          </Box>
        </Box>
      </Container>

      <Container>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {submissionStatus && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Complaint submitted successfully. Your tracking number is <strong>{submissionStatus}</strong>.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(300px, 0.85fr)' },
            gap: { xs: 3, md: 4 },
            alignItems: 'start',
          }}
        >
          <Box>
            <Card>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="overline" color="secondary.main">
                  Submit Complaint
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, mb: 1.4 }}>
                  Register a new case
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Provide clear information so the office can review the issue and respond appropriately.
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
                  <Box>
                    <TextField fullWidth label="Name" value={form.name} onChange={(event) => updateFormValue('name', event.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth label="Father Name" value={form.father_name} onChange={(event) => updateFormValue('father_name', event.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth label="Village" value={form.village} onChange={(event) => updateFormValue('village', event.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth label="Union Council" value={form.union_council} onChange={(event) => updateFormValue('union_council', event.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth label="CNIC" value={form.cnic} onChange={(event) => updateFormValue('cnic', event.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth label="Department (Optional)" value={form.department} onChange={(event) => updateFormValue('department', event.target.value)} />
                  </Box>
                  <Box>
                    <TextField fullWidth label="Phone Number" value={form.phone} onChange={(event) => updateFormValue('phone', event.target.value)} />
                  </Box>
                  <Box>
                    <TextField
                      select
                      fullWidth
                      label="Category"
                      value={form.category}
                      onChange={(event) => updateFormValue('category', event.target.value)}
                    >
                      {complaintCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={5}
                      value={form.description}
                      onChange={(event) => updateFormValue('description', event.target.value)}
                      helperText="Include the location, nature of the issue, and what support is required."
                    />
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Button variant="outlined" component="label" startIcon={<Attachment />}>
                      Attach image, PDF, or video
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf,video/*"
                        onChange={(event) => updateFormValue('attachment', event.target.files?.[0] || null)}
                      />
                    </Button>
                    <Typography color="text.secondary" sx={{ mt: 1.1, fontSize: '0.92rem' }}>
                      {form.attachment ? `Selected file: ${form.attachment.name}` : 'Supporting files are optional but often helpful.'}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Button onClick={handleSubmit} variant="contained" color="secondary" size="large" fullWidth disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Stack spacing={3}>
              {processNotes.map((note) => (
                <Paper key={note.title} sx={{ p: 3, border: '1px solid rgba(16,36,27,0.08)' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.1 }}>
                    <Box sx={{ color: 'secondary.main', display: 'inline-flex' }}>{note.icon}</Box>
                    {note.title}
                  </Typography>
                  <Typography color="text.secondary">{note.body}</Typography>
                </Paper>
              ))}

              <Paper
                sx={{
                  p: 3,
                  border: '1px solid rgba(24,41,63,0.08)',
                  background: 'linear-gradient(135deg, rgba(31,95,70,0.96) 0%, rgba(47,127,91,0.96) 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', mb: 1.2 }}>
                  Complaint workflow
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.76)' }}>
                  Submitted complaints can move through submitted, in progress, resolved, or declined stages, with remarks visible in the tracking history.
                </Typography>
              </Paper>
            </Stack>
          </Box>
        </Box>

        {trackingItems.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="overline" color="secondary.main">
              Tracking Results
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 3 }}>
              Complaint status and history
            </Typography>
            <Stack spacing={3}>
              {trackingItems.map((complaint) => (
                <TrackingCard key={complaint.id} complaint={complaint} />
              ))}
            </Stack>
          </Box>
        )}

        <Paper sx={{ mt: 5, p: 3.2, border: '1px solid rgba(16,36,27,0.08)' }}>
          <Typography variant="h6" sx={{ mb: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Gavel fontSize="small" color="secondary" />
            Why this system matters
          </Typography>
          <Typography color="text.secondary">
            A formal complaint workflow helps ensure requests are documented, casework is visible, and public support is handled with professionalism rather than informal follow-up alone.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
