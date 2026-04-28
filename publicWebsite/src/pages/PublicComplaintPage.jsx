import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  Alert,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { publicComplaintsAPI } from '../api/index.js';

const complaintCategories = [
  'Community Issue',
  'Infrastructure',
  'Health & Safety',
  'Employment',
  'Education',
  'Other',
];

export default function PublicComplaintPage() {
  const [form, setForm] = useState({
    name: '',
    cnic: '',
    phone: '',
    category: '',
    description: '',
    attachment: null,
  });
  const [trackingSearch, setTrackingSearch] = useState({ tracking_number: '', cnic: '' });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file) => {
    setForm((prev) => ({ ...prev, attachment: file }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await publicComplaintsAPI.create(form);
      setSubmissionStatus(response.data.tracking_number);
      setForm({ name: '', cnic: '', phone: '', category: '', description: '', attachment: null });
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to submit complaint.');
      console.error(err);
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
      setTrackingResult(null);
      setError(err.response?.data?.detail || 'Unable to locate complaint.');
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  const showTrackingDetails = () => {
    if (!trackingResult) return null;
    if (Array.isArray(trackingResult)) {
      return trackingResult.map((complaint) => (
        <Card key={complaint.id} sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              {complaint.category} • {complaint.status.replace('_', ' ')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
              {complaint.tracking_number}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
              {complaint.description}
            </Typography>
          </CardContent>
        </Card>
      ));
    }

    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            {trackingResult.category} • {trackingResult.status.replace('_', ' ')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
            {trackingResult.tracking_number}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
            {trackingResult.description}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ color: '#1b5e20', fontWeight: 700, mb: 2 }}>
              Citizen Services
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.05 }}>
              Submit a concern or request support from the office.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#475058', maxWidth: 560, lineHeight: 1.75 }}>
              Our office is committed to resolving community concerns with transparency and urgency. Use this form to share your issue and receive a complaint tracking number you can follow up on.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => document.getElementById('complaint-form')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Submit a Complaint
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, p: 3, boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Complaint Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Search by tracking number or CNIC to view the latest status for your request.
              </Typography>
              <TextField
                fullWidth
                label="Tracking Number"
                value={trackingSearch.tracking_number}
                onChange={(e) => setTrackingSearch((prev) => ({ ...prev, tracking_number: e.target.value }))}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="CNIC"
                value={trackingSearch.cnic}
                onChange={(e) => setTrackingSearch((prev) => ({ ...prev, cnic: e.target.value }))}
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
              />
              <Button
                variant="outlined"
                size="large"
                onClick={handleTrack}
                disabled={trackingLoading}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {trackingLoading ? 'Searching...' : 'Track Complaint'}
              </Button>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={6} sx={{ mt: 6 }}>
          <Grid item xs={12} md={7}>
            <Box id="complaint-form">
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                Submit your request
              </Typography>
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
              <Card sx={{ borderRadius: 4, p: { xs: 3, md: 4 } }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CNIC"
                      fullWidth
                      value={form.cnic}
                      onChange={(e) => handleChange('cnic', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Category"
                      fullWidth
                      value={form.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      variant="outlined"
                      size="small"
                    >
                      {complaintCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={6}
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" component="label" sx={{ textTransform: 'none' }}>
                      Upload Attachment
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf,video/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                      />
                    </Button>
                    {form.attachment && (
                      <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                        Selected file: {form.attachment.name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      {loading ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 4, p: 3, bgcolor: '#fff' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Why file a complaint?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                Filing a complaint helps our office to prioritize community needs, escalate urgent matters, and keep you updated through every step.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  What you can expect
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                  • A tracking number for every submission.
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                  • Status updates and transparent progress.
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                  • Option to attach evidence to strengthen your request.
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {trackingResult && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
              Tracking Results
            </Typography>
            {showTrackingDetails()}
          </Box>
        )}
      </Container>
    </Box>
  );
}
