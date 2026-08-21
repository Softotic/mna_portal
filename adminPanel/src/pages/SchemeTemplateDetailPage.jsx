import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Avatar,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  CalendarTodayOutlined,
  Close as CloseIcon,
  Comment,
  Delete,
  Edit,
  PersonOutlined,
  Search,
  Send,
} from '@mui/icons-material';
import { schemeTemplatesAPI, schemeTemplateEntriesAPI, schemeEntryCommentsAPI } from '../api';
import { useAuth } from '../auth/AuthContext';
import AdminTablePagination from '../components/AdminTablePagination';
import SchemeStatusChip from '../components/SchemeStatusChip';
import {
  DEFAULT_SCHEME_STATUS,
  SCHEME_STATUS_OPTIONS,
  getSchemeStatus,
} from '../constants/schemeStatus';
import { useAdminFeedback } from '../feedback/AdminFeedbackContext';

function EntryDetailField({ label, value }) {
  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <Box component="div" sx={{ minWidth: 0, minHeight: 84, p: 2, bgcolor: 'background.paper' }}>
      <Typography component="dt" variant="caption" sx={{ mb: 0.75, color: 'text.secondary', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography
        component="dd"
        variant="body2"
        sx={{ m: 0, color: hasValue ? 'text.primary' : 'text.secondary', fontWeight: hasValue ? 560 : 400, overflowWrap: 'anywhere' }}
      >
        {hasValue ? String(value) : 'Not provided'}
      </Typography>
    </Box>
  );
}

function SchemeStatusLegend() {
  return (
    <Box
      component="section"
      aria-labelledby="scheme-status-legend-title"
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 2 },
        px: 3,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        id="scheme-status-legend-title"
        variant="caption"
        sx={{ flexShrink: 0, color: 'text.secondary', fontWeight: 700 }}
      >
        Row colors
      </Typography>
      <Box
        component="ul"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: { xs: 1.25, sm: 2 },
          m: 0,
          p: 0,
          listStyle: 'none',
        }}
      >
        {SCHEME_STATUS_OPTIONS.map((option) => (
          <Box
            component="li"
            key={option.value}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                width: 14,
                height: 14,
                flexShrink: 0,
                borderRadius: '3px',
                bgcolor: option.rowBackgroundColor,
                border: `1px solid ${option.color}80`,
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {option.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function SchemeTemplateDetailPage() {
  const { category_slug, template_id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { notify } = useAdminFeedback();
  const canAdd = hasPermission(category_slug ? category_slug.toUpperCase() : 'SCHEMES', 'create');

  const [template, setTemplate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [values, setValues] = useState({});
  const [status, setStatus] = useState(DEFAULT_SCHEME_STATUS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit and Delete states
  const [editEntry, setEditEntry] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editStatus, setEditStatus] = useState(DEFAULT_SCHEME_STATUS);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Detail modal and comments states
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTemplate = useCallback(() => {
    schemeTemplatesAPI.get(template_id)
      .then(res => setTemplate(res.data))
      .catch(console.error);
  }, [template_id]);

  const fetchEntries = useCallback(() => {
    schemeTemplateEntriesAPI.list({ template_id })
      .then(res => setEntries(res.data.results || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [template_id]);

  useEffect(() => {
    fetchTemplate();
    fetchEntries();
  }, [fetchEntries, fetchTemplate]);

  useEffect(() => {
    if (template?.field_definitions) {
      const initialValues = {};
      template.field_definitions.forEach((field) => {
        initialValues[field] = values[field] ?? '';
      });
      setValues(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  const handleValueChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditValueChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditEntry = (entry) => {
    setEditEntry(entry);
    setEditValues(entry.values || {});
    setEditStatus(entry.status || DEFAULT_SCHEME_STATUS);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editEntry) return;
    setSaving(true);

    try {
      await schemeTemplateEntriesAPI.update(editEntry.id, {
        template_id: template.id,
        values: editValues,
        status: editStatus,
      });
      setEditDialogOpen(false);
      setEditEntry(null);
      fetchEntries();
    } catch (err) {
      notify(err.response?.data?.detail || 'Unable to update the entry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = (entryId) => {
    setDeleteEntryId(entryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEntryId) return;

    try {
      await schemeTemplateEntriesAPI.delete(deleteEntryId);
      setDeleteDialogOpen(false);
      setDeleteEntryId(null);
      fetchEntries();
    } catch {
      notify('Unable to delete the entry.', 'error');
    }
  };

  const handleEntryClick = async (entry) => {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
    setCommentsLoading(true);
    setNewComment('');
    
    try {
      const response = await schemeEntryCommentsAPI.list({ entry_id: entry.id });
      setComments(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedEntry || commentSaving) return;
    setCommentSaving(true);

    try {
      await schemeEntryCommentsAPI.create({
        entry: selectedEntry.id,
        comment: newComment.trim(),
      });
      
      // Refresh comments
      const response = await schemeEntryCommentsAPI.list({ entry_id: selectedEntry.id });
      setComments(response.data.results || response.data);
      setNewComment('');
    } catch {
      notify('Unable to add the comment.', 'error');
    } finally {
      setCommentSaving(false);
    }
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    
    // Search in all field values
    for (const field of template?.field_definitions || []) {
      if (entry.values?.[field]?.toLowerCase().includes(searchLower)) {
        return true;
      }
    }
    
    // Search in created_by_name
    if (entry.created_by_name?.toLowerCase().includes(searchLower)) {
      return true;
    }

    if (getSchemeStatus(entry.status).label.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredEntries.length / rowsPerPage) - 1));
  const visibleEntries = filteredEntries.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!template) return;
    setSaving(true);

    try {
      await schemeTemplateEntriesAPI.create({
        template_id: template.id,
        values,
        status,
      });
      setValues(Object.fromEntries(Object.keys(values).map((key) => [key, ''])));
      setStatus(DEFAULT_SCHEME_STATUS);
      fetchEntries();
    } catch (err) {
      notify(err.response?.data?.detail || 'Unable to save the scheme entry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(category_slug ? `/schemes/${category_slug}` : '/schemes')} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
            {template.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {template.category_name}
          </Typography>
        </Box>
      </Box>

      {/* Add Entry Form Card */}
      {canAdd && <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Add New Entry"
          slotProps={{ title: { variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } } }}
          sx={{ pb: 2, pt: 3, px: 3, bgcolor: '#fafbfc' }}
        />
        <Divider />
        <CardContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill out the fields below to create a new entry.
          </Typography>

          {template.field_definitions.length === 0 ? (
            <Typography color="text.secondary">
              This scheme has no fields yet. Go back and edit the scheme to add field names first.
            </Typography>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(auto-fit, minmax(190px, 1fr))' },
                  gap: 2.5,
                }}
              >
                <TextField
                  select
                  label="Status"
                  name="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  fullWidth
                  size="small"
                >
                  {SCHEME_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                {template.field_definitions.map((field) => (
                  <TextField
                    key={field}
                    label={field}
                    name={field}
                    value={values[field] || ''}
                    onChange={(event) => handleValueChange(field, event.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#fff',
                        '&:hover fieldset': { borderColor: '#d0d0d0' },
                      },
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setValues(Object.fromEntries(Object.keys(values).map((key) => [key, ''])));
                    setStatus(DEFAULT_SCHEME_STATUS);
                  }}
                >
                  Clear
                </Button>
                <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Add Entry'}
                </Button>
              </Box>
            </Box>
          )}

        </CardContent>
      </Card>}

      {/* Existing Entries Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', mt: 4 }}>
        <CardHeader
          title="Existing Entries"
          slotProps={{ title: { variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } } }}
          sx={{
            pb: 2,
            pt: 3,
            px: 3,
            bgcolor: '#fafbfc',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1.5, sm: 2 },
            '& .MuiCardHeader-action': {
              width: { xs: '100%', sm: 'auto' },
              m: 0,
            },
          }}
          action={entries.length > 0 && (
            <TextField
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              slotProps={{
                input: { startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#999' }} />
                  </InputAdornment>
                ) },
              }}
              variant="outlined"
              size="small"
              sx={{ width: { xs: '100%', sm: '280px' }, mr: 0 }}
            />
          )}
        />
        <Divider />
        {entries.length > 0 && <SchemeStatusLegend />}
        <CardContent sx={{ pt: 0 }}>
          {loading ? (
            <Box sx={{ py: 4 }}><LinearProgress /></Box>
          ) : entries.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No entries have been added yet.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafbfc', '& th': { fontWeight: 600, fontSize: '0.875rem', color: '#4a4a4a' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    {template.field_definitions.map((field) => (
                      <TableCell key={field} sx={{ fontWeight: 600 }}>{field}</TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.length === 0 && searchQuery ? (
                    <TableRow>
                      <TableCell colSpan={template.field_definitions.length + 2} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary" variant="body2">No entries match your search</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {visibleEntries.map((entry, idx) => {
                    const statusMeta = getSchemeStatus(entry.status);
                    return (
                      <TableRow
                        key={entry.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          bgcolor: statusMeta.rowBackgroundColor,
                          '& td': {
                            py: 1.5,
                            px: 2,
                            bgcolor: statusMeta.rowBackgroundColor,
                          },
                          '&:hover td': { bgcolor: statusMeta.rowHoverColor },
                        }}
                        onClick={() => handleEntryClick(entry)}
                      >
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{currentPage * rowsPerPage + idx + 1}</TableCell>
                        {template.field_definitions.map((field) => (
                          <TableCell key={field} sx={{ fontSize: '0.875rem' }}>{entry.values?.[field] || '-'}</TableCell>
                        ))}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }} title="Edit">
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} title="Delete">
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
        <AdminTablePagination
          count={filteredEntries.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        />
      </Card>

      {/* Edit Entry Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pt: 3 }}>Edit Entry</DialogTitle>
          <DialogContent dividers sx={{ pt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Update the entry information below.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
              <TextField
                select
                label="Status"
                name="status"
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value)}
                fullWidth
                size="small"
              >
                {SCHEME_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              {template?.field_definitions.map((field) => (
                <TextField
                  key={field}
                  label={field}
                  name={field}
                  value={editValues[field] || ''}
                  onChange={(event) => handleEditValueChange(field, event.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>
              {saving ? 'Updating...' : 'Update Entry'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pt: 3 }}>Confirm Deletion</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete this entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Entry Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: { xs: 'calc(100vh - 24px)', sm: 'calc(100vh - 48px)' },
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle component="div" sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 2, sm: 3 }, py: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2,
                bgcolor: 'action.selected',
                color: 'primary.main',
              }}
            >
              <Comment fontSize="small" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography component="h2" variant="h6">Entry details</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {template.title}
              </Typography>
            </Box>
            <IconButton aria-label="Close entry details" onClick={() => setDetailModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#F7F9F8' }}>
          {selectedEntry && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Scheme information</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current details and progress for this entry.
                  </Typography>
                </Box>
                <SchemeStatusChip status={selectedEntry.status} />
              </Box>

              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
                  gap: '1px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'divider',
                }}
              >
                {template?.field_definitions.map((field) => (
                  <EntryDetailField key={field} label={field} value={selectedEntry.values?.[field]} />
                ))}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 4 }, mt: 2, px: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Added by</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedEntry.created_by_name || 'Unknown'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayOutlined sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="body2" color="text.secondary">Added on</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {new Date(selectedEntry.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Comments</Typography>
                {!commentsLoading && (
                  <Box
                    component="span"
                    sx={{ minWidth: 24, height: 24, px: 0.75, display: 'inline-grid', placeItems: 'center', borderRadius: 12, bgcolor: 'action.selected', color: 'primary.dark', fontSize: '0.75rem', fontWeight: 800 }}
                  >
                    {comments.length}
                  </Box>
                )}
              </Box>

              {commentsLoading ? (
                <Box sx={{ py: 2 }}><LinearProgress /></Box>
              ) : comments.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Comment sx={{ mb: 1, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">
                    No comments yet. Add the first update below.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {comments.map((comment) => (
                    <Box
                      key={comment.id}
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 0 } }}
                    >
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'action.selected', color: 'primary.dark', fontSize: '0.8rem', fontWeight: 800 }}>
                        {comment.created_by_name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1, rowGap: 0.25, mb: 0.25 }}>
                          <Typography variant="subtitle2">
                            {comment.created_by_name || 'Unknown user'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                          {comment.comment}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  label="Add a comment"
                  placeholder="Write an update or note…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  multiline
                  minRows={2}
                  maxRows={5}
                  size="small"
                  variant="outlined"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mt: 1.25 }}>
                  <Typography variant="caption" color="text.secondary">
                    Enter to send · Shift+Enter for a new line
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || commentSaving}
                  >
                    {commentSaving ? 'Sending…' : 'Send comment'}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Button onClick={() => setDetailModalOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
