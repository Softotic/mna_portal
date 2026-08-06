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
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { portfolioCategoriesAPI, portfolioSchemesAPI, portfolioUcsAPI } from '../api/index.js';
import AdminTablePagination from '../components/AdminTablePagination.jsx';

const emptyUc = { name: '', description: '' };
const emptyCategory = { union_council: '', name: '', description: '' };
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
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [ucs, setUcs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyUc);

  const orderedUcs = useMemo(() => ordered(ucs), [ucs]);
  const orderedCategories = useMemo(() => ordered(categories), [categories]);
  const orderedSchemes = useMemo(() => ordered(schemes), [schemes]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ucResponse, categoryResponse, schemeResponse] = await Promise.all([
        portfolioUcsAPI.list({ ordering: 'sort_order' }),
        portfolioCategoriesAPI.list({ ordering: 'sort_order' }),
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

  const openDialog = (type, item = null) => {
    setDialog(type);
    setEditing(item);
    if (type === 'uc') setForm(item ? { name: item.name || '', description: item.description || '' } : emptyUc);
    if (type === 'category') {
      setForm(
        item
          ? { union_council: item.union_council || '', name: item.name || '', description: item.description || '' }
          : { ...emptyCategory, union_council: orderedUcs[0]?.id || '' },
      );
    }
    if (type === 'scheme') {
      const firstUc = orderedUcs[0]?.id || '';
      const firstCategory = orderedCategories.find((category) => String(category.union_council) === String(firstUc))?.id || '';
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
          : { ...emptyScheme, union_council: firstUc, category: firstCategory },
      );
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (dialog === 'uc') {
        editing ? await portfolioUcsAPI.update(editing.id, form) : await portfolioUcsAPI.create(form);
      }
      if (dialog === 'category') {
        editing ? await portfolioCategoriesAPI.update(editing.id, form) : await portfolioCategoriesAPI.create(form);
      }
      if (dialog === 'scheme') {
        editing ? await portfolioSchemesAPI.update(editing.id, form) : await portfolioSchemesAPI.create(form);
      }
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

  const remove = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      if (type === 'uc') await portfolioUcsAPI.delete(id);
      if (type === 'category') await portfolioCategoriesAPI.delete(id);
      if (type === 'scheme') await portfolioSchemesAPI.delete(id);
      setMessage('Portfolio item deleted.');
      loadAll();
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete portfolio item.');
    }
  };

  const move = async (type, item, direction) => {
    const source =
      type === 'uc'
        ? orderedUcs
        : type === 'category'
          ? orderedCategories.filter((row) => String(row.union_council) === String(item.union_council))
          : orderedSchemes.filter((row) => String(row.union_council) === String(item.union_council) && String(row.category) === String(item.category));
    const api = type === 'uc' ? portfolioUcsAPI : type === 'category' ? portfolioCategoriesAPI : portfolioSchemesAPI;
    const currentIndex = source.findIndex((sourceItem) => sourceItem.id === item.id);
    const targetIndex = currentIndex + direction;
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= source.length) return;

    const reordered = [...source];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await Promise.all(
        reordered.map((row, index) =>
          row.sort_order === index ? Promise.resolve() : api.update(row.id, { sort_order: index }),
        ),
      );
      loadAll();
    } catch (error) {
      console.error(error);
      setMessage('Unable to update order.');
    }
  };

  const categoryOptions = orderedCategories.filter((category) => String(category.union_council) === String(form.union_council));

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Portfolio Scheme Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage public district schemes by union council and category.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => openDialog(tab === 0 ? 'uc' : tab === 1 ? 'category' : 'scheme')}>
          Add {tab === 0 ? 'Union Council' : tab === 1 ? 'Category' : 'Scheme'}
        </Button>
      </Box>

      {message && <Alert sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      <Card sx={{ overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, bgcolor: '#fafbfc' }}>
          <Tab label="Union Councils" />
          <Tab label="Categories" />
          <Tab label="Schemes" />
        </Tabs>
        {tab === 0 && (
          <PortfolioTable rows={orderedUcs} columns={['Name', 'Description', 'Order']} renderRow={(row, index) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.description || 'N/A'}</TableCell>
              <TableCell><OrderButtons value={index + 1} isFirst={index === 0} isLast={index === orderedUcs.length - 1} onUp={() => move('uc', row, -1)} onDown={() => move('uc', row, 1)} /></TableCell>
              <Actions onEdit={() => openDialog('uc', row)} onDelete={() => remove('uc', row.id)} />
            </TableRow>
          )} />
        )}
        {tab === 1 && (
          <PortfolioTable rows={orderedCategories} columns={['Name', 'Union Council', 'Description', 'Order']} renderRow={(row, index) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.union_council_name}</TableCell>
              <TableCell>{row.description || 'N/A'}</TableCell>
              <TableCell>
                <OrderButtons
                  value={index + 1}
                  isFirst={orderedCategories.filter((item) => String(item.union_council) === String(row.union_council))[0]?.id === row.id}
                  isLast={orderedCategories.filter((item) => String(item.union_council) === String(row.union_council)).at(-1)?.id === row.id}
                  onUp={() => move('category', row, -1)}
                  onDown={() => move('category', row, 1)}
                />
              </TableCell>
              <Actions onEdit={() => openDialog('category', row)} onDelete={() => remove('category', row.id)} />
            </TableRow>
          )} />
        )}
        {tab === 2 && (
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
                  value={index + 1}
                  isFirst={orderedSchemes.filter((item) => String(item.union_council) === String(row.union_council) && String(item.category) === String(row.category))[0]?.id === row.id}
                  isLast={orderedSchemes.filter((item) => String(item.union_council) === String(row.union_council) && String(item.category) === String(row.category)).at(-1)?.id === row.id}
                  onUp={() => move('scheme', row, -1)}
                  onDown={() => move('scheme', row, 1)}
                />
              </TableCell>
              <Actions onEdit={() => openDialog('scheme', row)} onDelete={() => remove('scheme', row.id)} />
            </TableRow>
          )} />
        )}
      </Card>

      <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Edit' : 'Add'} {dialog === 'uc' ? 'Union Council' : dialog === 'category' ? 'Category' : 'Scheme'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            {dialog !== 'uc' && (
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Union Council" value={form.union_council} onChange={(event) => setForm((prev) => ({ ...prev, union_council: event.target.value, category: '' }))}>
                  {orderedUcs.map((uc) => <MenuItem key={uc.id} value={uc.id}>{uc.name}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            {dialog === 'scheme' && (
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}>
                  {categoryOptions.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={dialog === 'uc' ? 12 : 6}>
              <TextField fullWidth required label={dialog === 'scheme' ? 'Scheme Name' : 'Name'} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </Grid>
            {dialog === 'scheme' && (
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="past">Past</MenuItem>
                  <MenuItem value="future">Future</MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={dialog === 'scheme' ? 4 : 3} label="Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
            </Grid>
            {dialog === 'scheme' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Tags" value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} helperText="Comma-separated" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Notes" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Image</Typography>
                  <input type="file" accept="image/*" onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Additional Images</Typography>
                  <input type="file" accept="image/*" multiple onChange={(event) => setForm((prev) => ({ ...prev, images: Array.from(event.target.files || []) }))} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.7 }}>
                    Add one or more images for a slideshow on the public scheme page.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Attachment</Typography>
                  <input type="file" onChange={(event) => setForm((prev) => ({ ...prev, attachment: event.target.files?.[0] || null }))} />
                </Grid>
              </>
            )}
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

function OrderButtons({ value, isFirst, isLast, onUp, onDown }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" sx={{ minWidth: 28 }}>{value}</Typography>
      <Tooltip title="Move up"><span><IconButton size="small" disabled={isFirst} onClick={onUp}><KeyboardArrowUp fontSize="small" /></IconButton></span></Tooltip>
      <Tooltip title="Move down"><span><IconButton size="small" disabled={isLast} onClick={onDown}><KeyboardArrowDown fontSize="small" /></IconButton></span></Tooltip>
    </Box>
  );
}

function Actions({ onEdit, onDelete }) {
  return (
    <TableCell align="right">
      <Tooltip title="Edit"><IconButton size="small" onClick={onEdit}><Edit fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={onDelete}><Delete fontSize="small" /></IconButton></Tooltip>
    </TableCell>
  );
}
