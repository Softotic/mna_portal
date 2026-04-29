import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Drawer, IconButton, Chip,
  TextField, MenuItem, CircularProgress, Alert, Grid, Tooltip
} from '@mui/material';
import { Close, Visibility, Assignment, Launch } from '@mui/icons-material';
import { format } from 'date-fns';
import { complaintsAdminAPI } from '../api';

const STATUS_COLORS = {
  pending: 'warning',
  in_progress: 'info',
  resolved: 'success',
  denied: 'error'
};

const CATEGORIES = {
  infrastructure: 'Infrastructure',
  education: 'Education',
  health: 'Health',
  water: 'Water & Sanitation',
  electricity: 'Electricity',
  security: 'Security & Law',
  environment: 'Environment',
  other: 'Other'
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Edit state
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      
      const res = await complaintsAdminAPI.list(params);
      setComplaints(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]); // Fetch on status change. Search will be triggered manually or via debounce.

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchComplaints();
    }
  };

  const openDrawer = async (id) => {
    try {
      const res = await complaintsAdminAPI.get(id);
      setSelectedComplaint(res.data);
      setEditStatus(res.data.status);
      setEditNote(res.data.admin_note || '');
      setDrawerOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load complaint details.');
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedComplaint(null);
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      await complaintsAdminAPI.updateStatus(selectedComplaint.id, {
        status: editStatus,
        admin_note: editNote
      });
      fetchComplaints();
      closeDrawer();
    } catch (err) {
      console.error(err);
      alert('Failed to update complaint.');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          Public Complaints
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search tracking ID, name, CNIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            label="Filter Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="denied">Denied</MenuItem>
          </TextField>
          <Button variant="contained" onClick={fetchComplaints}>
            Search
          </Button>
        </Box>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Tracking ID</TableCell>
                <TableCell>Complainant</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No complaints found.
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.tracking_id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.phone}</Typography>
                    </TableCell>
                    <TableCell>{row.category_display}</TableCell>
                    <TableCell>{format(new Date(row.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status_display} 
                        color={STATUS_COLORS[row.status] || 'default'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View & Manage">
                        <IconButton color="primary" onClick={() => openDrawer(row.id)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer} PaperProps={{ sx: { width: { xs: '100%', sm: 600 } } }}>
        {selectedComplaint && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9fa' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                  Tracking ID
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {selectedComplaint.tracking_id}
                </Typography>
              </Box>
              <IconButton onClick={closeDrawer}><Close /></IconButton>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
              <Grid container spacing={3}>
                {/* Complainant Info */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment fontSize="small" /> Complainant Details
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Full Name</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedComplaint.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">CNIC</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedComplaint.cnic}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedComplaint.phone}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Submitted On</Typography>
                        <Typography variant="body2" fontWeight={600}>{format(new Date(selectedComplaint.created_at), 'MMM dd, yyyy HH:mm')}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                {/* Complaint Info */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedComplaint.category_display}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                    Description
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fff' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {selectedComplaint.description}
                    </Typography>
                  </Paper>

                  {selectedComplaint.attachment && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                        Attachment
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<Launch />} 
                        href={selectedComplaint.attachment} 
                        target="_blank"
                      >
                        View Attached File
                      </Button>
                    </Box>
                  )}
                </Grid>

                {/* Management Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                    Status Management
                  </Typography>
                  
                  <TextField
                    select
                    fullWidth
                    label="Complaint Status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    sx={{ mb: 3 }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="denied">Denied</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Official Response / Admin Note"
                    placeholder="This note will be visible to the public when tracking if status is Resolved or Denied."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    helperText="Required for Resolved/Denied statuses."
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={closeDrawer} color="inherit" disabled={updateLoading}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdate} 
                disabled={updateLoading || ((editStatus === 'resolved' || editStatus === 'denied') && !editNote.trim())}
              >
                {updateLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
