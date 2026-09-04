// Academic Hub - REST API Endpoints & Routes Controller
import express from 'express';
import multer from 'multer';
import { db } from './db.js';
import { ragEngine } from './rag.js';
import { learningEngine } from './learning-engine.js';
import { triAgentsManager } from './tri-agents.js';
import { geminiService } from './gemini.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// 1. Promotions & Courses
router.get('/promotions', (req, res) => {
  res.json({ success: true, data: db.data.promotions });
});

router.get('/courses', (req, res) => {
  let courses = db.data.courses;
  if (req.query.promotionId) {
    courses = courses.filter(c => c.promotionId === req.query.promotionId);
  }
  res.json({ success: true, data: courses });
});

// 2. Resources & Search
router.get('/resources', (req, res) => {
  const { courseId, promotionId, type, academicYear, search, hasCorrection } = req.query;
  const list = db.getResources({ courseId, promotionId, type, academicYear, search, hasCorrection });
  res.json({ success: true, count: list.length, data: list });
});

router.get('/resources/:id', (req, res) => {
  const resource = db.getResourceById(req.params.id);
  if (!resource) {
    return res.status(404).json({ success: false, error: 'Document introuvable dans le corpus académique.' });
  }
  const relatedData = db.getRelatedResources(req.params.id);
  res.json({ success: true, data: { ...resource, ...relatedData } });
});

// Update / Validate Resource (Visual Validation Page 53)
router.post('/resources/:id/validate', (req, res) => {
  const updated = db.updateResource(req.params.id, {
    status: 'published',
    validationStatus: 'approved',
    confidenceScore: 1.0,
    ...req.body
  });
  if (!updated) return res.status(404).json({ success: false, error: 'Document introuvable.' });
  res.json({ success: true, data: updated });
});

router.delete('/resources/:id', (req, res) => {
  const ok = db.deleteResource(req.params.id);
  res.json({ success: ok });
});

// 3. Videos Catalog
router.get('/videos', (req, res) => {
  res.json({ success: true, data: db.data.videos });
});

// 4. Learning Agent & Chat
router.post('/assistant/message', async (req, res) => {
  try {
    const { studentId, message, mode, courseId, userApiKey } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message requis.' });
    }

    const response = await learningEngine.processInteraction({
      studentId: studentId || 'default-student',
      message,
      mode: mode || 'chat',
      courseId: courseId || '',
      userApiKey: userApiKey || ''
    });

    res.json({ success: true, data: response });
  } catch (err) {
    console.error('Assistant error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/learning/state', (req, res) => {
  const studentId = req.query.studentId || 'default-student';
  const state = learningEngine.getState(studentId);
  res.json({ success: true, data: state });
});

router.post('/learning/state/level', (req, res) => {
  const { studentId, level } = req.body;
  const updated = learningEngine.setDeclaredLevel(studentId || 'default-student', level);
  res.json({ success: true, data: updated });
});

router.post('/learning/state/close-branch', (req, res) => {
  const { studentId, branchId, masteryScore } = req.body;
  const tree = learningEngine.closeBranch(studentId || 'default-student', branchId, masteryScore || 0.8);
  res.json({ success: true, data: tree });
});

// 5. Admin & Tri-Agents
router.get('/admin/workers', (req, res) => {
  res.json({ success: true, data: triAgentsManager.getStatus() });
});

router.get('/admin/jobs', (req, res) => {
  res.json({ success: true, data: db.getJobs() });
});

router.get('/admin/audit', (req, res) => {
  res.json({ success: true, data: db.getAuditLogs() });
});

// Drag & Drop Upload
router.post('/admin/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const bodyContent = req.body.content;
    const userApiKey = req.body.userApiKey || '';

    let content = bodyContent || '';
    let fileName = req.body.fileName || (file ? file.originalname : `document_${Date.now()}.txt`);
    let fileSize = file ? `${Math.round(file.size / 1024)} Ko` : '150 Ko';

    if (file && file.buffer && !content) {
      content = file.buffer.toString('utf-8');
    }

    if (!content) {
      content = `Contenu du fichier universitaire : ${fileName}\nCe document académique a été téléversé pour classification et indexation automatique.`;
    }

    // Determine format
    const ext = fileName.split('.').pop().toLowerCase();
    let format = 'pdf';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) format = 'office';
    else if (['cpp', 'py', 'java', 'js', 'sql', 'c', 'h'].includes(ext)) format = 'code';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) format = 'image';
    else if (['mp3', 'mp4', 'wav'].includes(ext)) format = 'media';

    // Create job
    const job = db.addJob({
      fileName,
      fileSize,
      format,
      content,
      type: 'INGESTION_FILE'
    });

    // Run async through Tri-Agents
    triAgentsManager.processIngestionJob(job.id, userApiKey).catch(err => {
      console.error('Tri-Agent ingestion job error:', err);
    });

    res.json({
      success: true,
      message: 'Fichier pris en charge par le système Tri-Agents pour extraction et classification.',
      jobId: job.id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Console Ad-Hoc Commands (Page 51)
router.post('/admin/console', async (req, res) => {
  const { command, userApiKey } = req.body;
  if (!command) return res.status(400).json({ success: false, error: 'Commande requise.' });

  try {
    const result = await triAgentsManager.executeAdHocCommand(command, userApiKey);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User-provided API Key testing (Page 36)
router.post('/user-key/test', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Format de clé API invalide.' });
  }

  const testResult = await geminiService.testKey(apiKey.trim());
  res.json(testResult);
});

export default router;
