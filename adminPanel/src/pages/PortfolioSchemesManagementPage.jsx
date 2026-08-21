import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  AttachFileOutlined,
  Close,
  Delete,
  Edit,
  ImageOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  PhotoLibraryOutlined,
} from '@mui/icons-material';
import { portfolioSchemesAPI, schemeCategoriesAPI, unionCouncilsAPI } from '../api/index.js';
import AdminTablePagination from '../components/AdminTablePagination.jsx';
import { useAdminFeedback } from '../feedback/AdminFeedbackContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const emptyScheme = {
  union_council: '',
  category: '',
  name: '',
  description: '',
  status: 'ongoing',
  image: null,
  images: [],
  attachment: null,
  tags: '',
  notes: '',
};

function ordered(items) {
  return [...items].sort((a, b) => {
    const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return (a.name || '').localeCompare(b.name || '');
  });
}

function statusColor(status) {
  if (status === 'ongoing') return 'success';
  if (status === 'future') return 'info';
  return 'default';
}

export default function PortfolioSchemesManagementPage() {
  const { confirm } = useAdminFeedback();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('PORTFOLIO', 'create');
  const canEdit = hasPermission('PORTFOLIO', 'edit');
  const canDelete = hasPermission('PORTFOLIO', 'delete');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [ucs, setUcs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyScheme);

  const orderedUcs = useMemo(() => ordered(ucs), [ucs]);
  const orderedCategories = useMemo(() => ordered(categories), [categories]);
  const orderedSchemes = useMemo(() => ordered(schemes), [schemes]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ucResponse, categoryResponse, schemeResponse] = await Promise.all([
        unionCouncilsAPI.list({ ordering: 'name' }),
        schemeCategoriesAPI.list(),
        portfolioSchemesAPI.list({ ordering: 'sort_order' }),
      ]);
      setUcs(Array.isArray(ucResponse.data) ? ucResponse.data : ucResponse.data?.results || []);
      setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : categoryResponse.data?.results || []);
      setSchemes(Array.isArray(schemeResponse.data) ? schemeResponse.data : schemeResponse.data?.results || []);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load portfolio schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openDialog = (item = null) => {
    setDialog(true);
    setEditing(item);
    setForm(
      item
        ? {
            union_council: item.union_council || '',
            category: item.category || '',
            name: item.name || '',
            description: item.description || '',
            status: item.status || 'ongoing',
            image: null,
            images: [],
            attachment: null,
            tags: item.tags || '',
            notes: item.notes || '',
          }
        : {
            ...emptyScheme,
            union_council: orderedUcs[0]?.id || '',
            category: orderedCategories[0]?.id || '',
          },
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      editing ? await portfolioSchemesAPI.update(editing.id, form) : await portfolioSchemesAPI.create(form);
      setMessage('Portfolio saved successfully.');
      setDialog(null);
      await loadAll();
    } catch (error) {
      console.error(error);
      setMessage('Unable to save portfolio item.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const typeLabel = 'portfolio scheme';
    const approved = await confirm({
      title: `Delete ${typeLabel}?`,
      description: `This permanently removes the ${typeLabel} from the portfolio section.`,
      itemName: item.name,
      confirmLabel: 'Delete item',
    });
    if (!approved) return;
    try {
      await portfolioSchemesAPI.delete(item.id);
      setMessage('Portfolio item deleted.');
      loadAll();
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete portfolio item.');
    }
  };

  const move = async (item, direction) => {
    const source = orderedSchemes.filter(
      (row) => String(row.union_council) === String(item.union_council) && String(row.category) === String(item.category),
    );
    const currentIndex = source.findIndex((sourceItem) => sourceItem.id === item.id);
    const targetIndex = currentIndex + direction;
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= source.length) return;

    const reordered = [...source];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await Promise.all(
        reordered.map((row, index) =>
          row.sort_order === index ? Promise.resolve() : portfolioSchemesAPI.update(row.id, { sort_order: index }),
        ),
      );
      loadAll();
    } catch (error) {
      console.error(error);
      setMessage('Unable to update order.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Portfolio Scheme Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage public district schemes using shared Category and Union Council metadata.
          </Typography>
        </Box>
        {canCreate && <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
          Add Scheme
        </Button>}
      </Box>

      {message && <Alert sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      <Card sx={{ overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <PortfolioTable rows={orderedSchemes} columns={['Scheme', 'UC / Category', 'Status', 'Order']} renderRow={(row, index) => (
          <TableRow key={row.id} hover>
            <TableCell>
              <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
              <Typography variant="body2" color="text.secondary">{row.description || 'No description'}</Typography>
            </TableCell>
            <TableCell>{row.union_council_name} / {row.category_name}</TableCell>
            <TableCell><Chip size="small" label={row.status} color={statusColor(row.status)} /></TableCell>
            <TableCell>
              <OrderButtons
                disabled={!canEdit}
                value={index + 1}
                isFirst={orderedSchemes.filter((item) => String(item.union_council) === String(row.union_council) && String(item.category) === String(row.category))[0]?.id === row.id}
                isLast={orderedSchemes.filter((item) => String(item.union_council) === String(row.union_council) && String(item.category) === String(row.category)).at(-1)?.id === row.id}
                onUp={() => move(row, -1)}
                onDown={() => move(row, 1)}
              />
            </TableCell>
            <Actions canEdit={canEdit} canDelete={canDelete} onEdit={() => openDialog(row)} onDelete={() => remove(row)} />
          </TableRow>
        )} />
      </Card>

      <Dialog
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { maxWidth: 820, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2.5, bgcolor: '#F5FAF7', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Add fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography component="h2" variant="h6" sx={{ fontSize: '1.1rem' }}>
                {editing ? 'Edit portfolio scheme' : 'Add a portfolio scheme'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                Add the details that will appear on the public schemes page.
              </Typography>
            </Box>
            <IconButton aria-label="Close form" onClick={() => setDialog(null)} size="small" sx={{ mt: 0.15 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3 }}>
          <FormSection title="Scheme details" description="Choose where this scheme belongs, then add the public-facing information." />
          <Grid container spacing={2.25}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth required label="Union Council" value={form.union_council} onChange={(event) => setForm((prev) => ({ ...prev, union_council: event.target.value }))}>
                {orderedUcs.map((uc) => <MenuItem key={uc.id} value={uc.id}>{uc.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth required label="Category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}>
                {orderedCategories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required label="Scheme Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="past">Past</MenuItem>
                <MenuItem value="future">Future</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Description" placeholder="Briefly describe the project, its purpose, or expected benefit." value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tags" value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} helperText="Comma-separated" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Notes" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3.25 }} />
          <FormSection title="Media & files" description="A cover image is recommended. Add gallery images or a supporting document when useful." />
          <Grid container spacing={2.25}>
            <Grid item xs={12} md={6}>
              <FileUpload
                icon={<ImageOutlined fontSize="small" />}
                title="Cover image"
                description="JPG, PNG, or WebP"
                accept="image/*"
                fileName={form.image?.name}
                onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FileUpload
                icon={<PhotoLibraryOutlined fontSize="small" />}
                title="Gallery images"
                description="Add images for a public slideshow"
                accept="image/*"
                multiple
                fileName={form.images.length ? `${form.images.length} image${form.images.length === 1 ? '' : 's'} selected` : ''}
                onChange={(event) => setForm((prev) => ({ ...prev, images: Array.from(event.target.files || []) }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FileUpload
                icon={<AttachFileOutlined fontSize="small" />}
                title="Supporting attachment"
                description="Optional project document or report"
                fileName={form.attachment?.name}
                onChange={(event) => setForm((prev) => ({ ...prev, attachment: event.target.files?.[0] || null }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function FormSection({ title, description }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{description}</Typography>
    </Box>
  );
}

function FileUpload({ icon, title, description, accept, multiple = false, fileName, onChange }) {
  return (
    <Box
      sx={{
        minHeight: 118,
        p: 1.75,
        border: '1px dashed',
        borderColor: fileName ? 'primary.main' : '#B9C9C1',
        borderRadius: 2.5,
        bgcolor: fileName ? 'rgba(11, 93, 59, 0.045)' : '#FAFCFB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.45,
        transition: 'border-color 160ms ease, background-color 160ms ease',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(11, 93, 59, 0.035)' },
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'grid', placeItems: 'center', mb: 0.2 }}>{icon}</Box>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="caption" color="text.secondary">{fileName || description}</Typography>
      <Button component="label" size="small" variant="text" sx={{ minHeight: 28, px: 0.5, mt: 'auto' }}>
        {fileName ? 'Replace file' : 'Choose file'}
        <input hidden type="file" accept={accept} multiple={multiple} onChange={onChange} />
      </Button>
    </Box>
  );
}

function PortfolioTable({ rows, columns, renderRow }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1));
  const offset = currentPage * rowsPerPage;
  const visibleRows = rows.slice(offset, offset + rowsPerPage);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => <TableCell key={column}>{column}</TableCell>)}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, index) => renderRow(row, offset + index))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 8 }}>No records found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <AdminTablePagination
        count={rows.length}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
      />
    </>
  );
}

function OrderButtons({ value, isFirst, isLast, onUp, onDown, disabled = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" sx={{ minWidth: 28 }}>{value}</Typography>
      {!disabled && <Tooltip title="Move up"><span><IconButton size="small" disabled={isFirst} onClick={onUp}><KeyboardArrowUp fontSize="small" /></IconButton></span></Tooltip>}
      {!disabled && <Tooltip title="Move down"><span><IconButton size="small" disabled={isLast} onClick={onDown}><KeyboardArrowDown fontSize="small" /></IconButton></span></Tooltip>}
    </Box>
  );
}

function Actions({ onEdit, onDelete, canEdit, canDelete }) {
  return (
    <TableCell align="right">
      {canEdit && <Tooltip title="Edit"><IconButton size="small" onClick={onEdit}><Edit fontSize="small" /></IconButton></Tooltip>}
      {canDelete && <Tooltip title="Delete"><IconButton size="small" color="error" onClick={onDelete}><Delete fontSize="small" /></IconButton></Tooltip>}
    </TableCell>
  );
}
