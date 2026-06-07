import { useRef, useState } from 'react';
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { parseSpreadsheetFile, validateImportRows } from '../../utils/excelParser';
import { bulkAddContributors, getContributor } from '../../services/contributorService';
import { incrementEventStats } from '../../services/eventService';
import { generateCard } from '../../services/cardService';
import { getFirestoreErrorMessage } from '../../utils/firestoreErrors';
import { formatCurrency } from '../../utils/formatters';
import './ExcelImportModal.css';

const STEPS = { SELECT: 'select', PREVIEW: 'preview', IMPORTING: 'importing', DONE: 'done' };

export default function ExcelImportModal({ open, onClose, eventId, templateId, onImported }) {
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef(null);

  const [step, setStep] = useState(STEPS.SELECT);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState({ valid: [], invalid: [] });
  const [parsing, setParsing] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  function reset() {
    setStep(STEPS.SELECT);
    setFileName('');
    setParsed({ valid: [], invalid: [] });
    setImportedCount(0);
    setProgressLabel('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file) {
    if (!file) return;
    const validExtensions = /\.(xlsx|xls|csv)$/i;
    if (!validExtensions.test(file.name)) {
      toast.error('Please upload a .xlsx, .xls or .csv file.');
      return;
    }

    setFileName(file.name);
    setParsing(true);
    try {
      const rows = await parseSpreadsheetFile(file);
      const result = validateImportRows(rows);
      setParsed(result);
      setStep(STEPS.PREVIEW);
      if (!result.valid.length) {
        toast.warning('No valid rows were found. Please check the file format and try again.');
      }
    } catch (error) {
      console.error('Failed to parse import file:', error);
      toast.error(error.message || 'Could not parse the file.');
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  }

  async function handleImport() {
    if (!parsed.valid.length) return;
    setStep(STEPS.IMPORTING);

    try {
      setProgressLabel('Saving contributors…');
      const ids = await bulkAddContributors(user.uid, eventId, parsed.valid);

      const totalAmount = parsed.valid.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
      await incrementEventStats(eventId, { totalContributors: ids.length, totalAmount });

      setProgressLabel('Generating personalized cards…');
      let generated = 0;
      for (const id of ids) {
        const contributor = await getContributor(id);
        if (contributor) {
          await generateCard({ ownerId: user.uid, eventId, contributor, templateId });
          generated += 1;
        }
      }
      await incrementEventStats(eventId, { totalCards: generated });

      setImportedCount(ids.length);
      setStep(STEPS.DONE);
      toast.success(`Imported ${ids.length} contributor${ids.length === 1 ? '' : 's'} and generated their cards.`);
      onImported?.();
    } catch (err) {
      console.error('Failed to import contributors:', err);
      toast.error(getFirestoreErrorMessage(err));
      setStep(STEPS.PREVIEW);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bulk import contributors" size="lg">
      <div className="import-modal">
        {step === STEPS.SELECT && (
          <>
            <p className="import-instructions">
              Upload a spreadsheet with columns <strong>Name</strong>, <strong>Phone</strong> and{' '}
              <strong>Amount</strong>. Supported formats: .xlsx, .xls, .csv
            </p>
            <div
              className="import-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="visually-hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {parsing ? (
                <Spinner label="Reading your file…" />
              ) : (
                <>
                  <FiUploadCloud className="import-dropzone-icon" />
                  <p>Click or drag your spreadsheet here</p>
                  <span>.xlsx, .xls, .csv — max recommended: 1000 rows</span>
                </>
              )}
            </div>
          </>
        )}

        {step === STEPS.PREVIEW && (
          <div className="import-preview">
            <div className="import-summary">
              <div className="import-summary-item">
                <FiFileText />
                <div>
                  <strong>{fileName}</strong>
                  <span>Spreadsheet parsed successfully</span>
                </div>
              </div>
              <div className="import-summary-stats">
                <span className="import-stat-valid">
                  <FiCheckCircle /> {parsed.valid.length} valid
                </span>
                <span className="import-stat-invalid">
                  <FiAlertTriangle /> {parsed.invalid.length} invalid
                </span>
              </div>
            </div>

            {parsed.valid.length > 0 && (
              <div className="import-table-section">
                <h4>Ready to import ({parsed.valid.length})</h4>
                <div className="import-table-wrap">
                  <table className="import-table">
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.valid.slice(0, 50).map((row) => (
                        <tr key={row.rowNumber}>
                          <td>{row.rowNumber}</td>
                          <td>{row.name}</td>
                          <td>{row.phone}</td>
                          <td>{formatCurrency(row.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsed.valid.length > 50 && (
                    <p className="import-table-more">+ {parsed.valid.length - 50} more rows</p>
                  )}
                </div>
              </div>
            )}

            {parsed.invalid.length > 0 && (
              <div className="import-table-section">
                <h4 className="import-invalid-heading">Invalid rows ({parsed.invalid.length})</h4>
                <div className="import-table-wrap">
                  <table className="import-table">
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Amount</th>
                        <th>Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.invalid.slice(0, 50).map((entry) => (
                        <tr key={entry.rowNumber}>
                          <td>{entry.rowNumber}</td>
                          <td>{entry.row.name || '—'}</td>
                          <td>{entry.row.phone || '—'}</td>
                          <td>{entry.row.amount || '—'}</td>
                          <td className="import-invalid-issues">{entry.errors.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="import-actions">
              <Button variant="ghost" onClick={reset}>
                Choose a different file
              </Button>
              <Button onClick={handleImport} disabled={!parsed.valid.length}>
                Import {parsed.valid.length} contributor{parsed.valid.length === 1 ? '' : 's'} &amp; generate cards
              </Button>
            </div>
          </div>
        )}

        {step === STEPS.IMPORTING && (
          <div className="import-progress">
            <Spinner size={42} label={progressLabel || 'Importing…'} />
            <p>This can take a moment for larger lists. Please don&apos;t close this window.</p>
          </div>
        )}

        {step === STEPS.DONE && (
          <div className="import-done fade-in-up">
            <FiCheckCircle className="import-done-icon" />
            <h3>Import complete</h3>
            <p>
              {importedCount} contributor{importedCount === 1 ? '' : 's'} imported and personalized cards
              generated successfully.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
