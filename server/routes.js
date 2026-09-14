// Academic Hub - REST API Endpoints & Routes Controller
import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { db } from './db.js';
import { ragEngine } from './rag.js';
import { learningEngine } from './learning-engine.js';
import { triAgentsManager } from './tri-agents.js';
import { geminiService } from './gemini.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// 1. Promotions & Filières
router.get('/promotions', (req, res) => {
  res.json({ success: true, data: db.getPromotions() });
});

router.post('/promotions', (req, res) => {
  try {
    const promo = db.addPromotion(req.body);
    res.json({ success: true, data: promo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/promotions/:id', (req, res) => {
  try {
    const ok = db.deletePromotion(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Courses & Matières
router.get('/courses', (req, res) => {
  let courses = db.getCourses(req.query.promotionId);
  res.json({ success: true, data: courses });
});

router.post('/courses', (req, res) => {
  try {
    const course = db.addCourse(req.body);
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/courses/:id', (req, res) => {
  try {
    const updated = db.updateCourse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Cours introuvable.' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/courses/:id', (req, res) => {
  try {
    const ok = db.deleteCourse(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Resources & Search
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

router.post('/resources', (req, res) => {
  try {
    const result = db.addResource(req.body);
    res.json({ success: true, data: result.resource, duplicate: result.duplicate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

// Stream or download raw file
router.get('/resources/:id/file', (req, res) => {
  const resource = db.getResourceById(req.params.id);
  if (!resource) {
    return res.status(404).send('Document introuvable.');
  }

  if (resource.dataUrl && resource.dataUrl.startsWith('data:')) {
    const match = resource.dataUrl.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
    if (match) {
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resource.fileName || 'document.pdf')}"`);
      return res.send(buffer);
    }
  }

  // Fallback to text content
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resource.fileName || 'document.txt')}"`);
  res.send(resource.content || '');
});

// In-document page-by-page AI explanation
router.get('/resources/:id/explain-page', async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.page || '1', 10);
    const userApiKey = req.query.userApiKey || '';
    const explanation = await learningEngine.explainDocumentPage(req.params.id, pageNumber, userApiKey);
    if (!explanation) return res.status(404).json({ success: false, error: 'Document introuvable.' });
    res.json({ success: true, data: explanation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Exam Preparation & Syllabus Diagnostic
router.post('/exam/analyze/:id', async (req, res) => {
  try {
    const userApiKey = req.body.userApiKey || '';
    const prep = await learningEngine.analyzeExamPreparation(req.params.id, userApiKey);
    if (!prep) return res.status(404).json({ success: false, error: 'Document introuvable.' });
    res.json({ success: true, data: prep });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Student Learning Overview
router.get('/user/learning-overview', (req, res) => {
  const studentId = req.query.studentId || 'default-student';
  const overview = db.getLearningOverview(studentId);
  res.json({ success: true, data: overview });
});

// Favorites & History
router.get('/user/favorites', (req, res) => {
  const studentId = req.query.studentId || 'default-student';
  const favs = db.getFavorites(studentId);
  res.json({ success: true, data: favs });
});

router.post('/user/favorites/toggle', (req, res) => {
  const { studentId, resourceId, type, title, courseName, category } = req.body;
  if (!resourceId) return res.status(400).json({ success: false, error: 'resourceId requis.' });
  const favs = db.toggleFavorite(studentId || 'default-student', { resourceId, type, title, courseName, category });
  res.json({ success: true, data: favs });
});

router.get('/user/history', (req, res) => {
  const studentId = req.query.studentId || 'default-student';
  const history = db.getHistory(studentId);
  res.json({ success: true, data: history });
});

router.post('/user/history', (req, res) => {
  const { studentId, resourceId, title, courseName, pageNumber, totalPages } = req.body;
  if (!resourceId) return res.status(400).json({ success: false, error: 'resourceId requis.' });
  const history = db.recordHistory(studentId || 'default-student', { resourceId, title, courseName, pageNumber, totalPages });
  res.json({ success: true, data: history });
});

// 4. Videos Catalog
router.get('/videos', (req, res) => {
  res.json({ success: true, data: db.data.videos || [] });
});

// 5. Learning Agent & Chat
router.post('/assistant/message', async (req, res) => {
  try {
    const { studentId, message, mode, courseId, attachedDocId, userApiKey, image } = req.body;
    if (!message && !image) {
      return res.status(400).json({ success: false, error: 'Message ou image requis.' });
    }

    const response = await learningEngine.processInteraction({
      studentId: studentId || 'default-student',
      message: message || "Analyse de l'image jointe",
      mode: mode || 'chat',
      courseId: courseId || '',
      attachedDocId: attachedDocId || '',
      userApiKey: userApiKey || '',
      image: image || null
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

// Mode Apprendre - Parcours Adaptatif par Chapitre
router.get('/learning/courses', (req, res) => {
  try {
    const courses = learningEngine.getLearningCourses();
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/learning/session/active', (req, res) => {
  try {
    const studentId = req.query.studentId || 'default-student';
    const active = db.getActiveSessionForStudent(studentId);
    res.json({ success: true, data: active });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/learning/session/start', async (req, res) => {
  try {
    const { studentId, courseId, chapterId, userApiKey } = req.body;
    if (!courseId || !chapterId) {
      return res.status(400).json({ success: false, error: 'courseId et chapterId sont requis.' });
    }
    const session = await learningEngine.initChapterLearningSession({
      studentId: studentId || 'default-student',
      courseId,
      chapterId,
      userApiKey
    });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/learning/session/step', async (req, res) => {
  try {
    const { sessionId, studentInput, action, userApiKey } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId est requis.' });
    }
    const result = await learningEngine.processChapterLearningStep({
      sessionId,
      studentInput,
      action: action || 'answer',
      userApiKey
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/learning/session/:sessionId/where-are-we', (req, res) => {
  try {
    const data = learningEngine.getChapterWhereAreWe(req.params.sessionId);
    if (!data) return res.status(404).json({ success: false, error: 'Session introuvable.' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/learning/session/:sessionId/assessment', (req, res) => {
  try {
    const assessment = learningEngine.getChapterAssessment(req.params.sessionId);
    if (!assessment) return res.status(404).json({ success: false, error: 'Session introuvable.' });
    res.json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/learning/session/:sessionId/assessment/submit', (req, res) => {
  try {
    const { answers } = req.body;
    const result = learningEngine.submitChapterAssessment(req.params.sessionId, answers || {});
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/learning/session/:sessionId', (req, res) => {
  try {
    const ok = db.deleteLearningSession(req.params.sessionId);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Admin & Tri-Agents
router.get('/admin/workers', (req, res) => {
  res.json({ success: true, data: triAgentsManager.getStatus() });
});

router.get('/admin/jobs', (req, res) => {
  res.json({ success: true, data: db.getJobs() });
});

router.get('/admin/audit', (req, res) => {
  res.json({ success: true, data: db.getAuditLogs() });
});

// Direct Reset Database
router.post('/database/reset', (req, res) => {
  try {
    db.clearAllAcademicData();
    res.json({ success: true, message: 'Base de données et tables réinitialisées avec succès.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Drag & Drop Upload
router.post('/admin/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const bodyContent = req.body.content;
    const userApiKey = req.body.userApiKey || '';
    const courseId = req.body.courseId || '';
    const resourceType = req.body.resourceType || req.body.type || '';

    let content = bodyContent || '';
    let fileName = req.body.fileName || (file ? file.originalname : `document_${Date.now()}.txt`);
    let fileSize = file ? `${Math.round(file.size / 1024)} Ko` : '150 Ko';
    let dataUrl = '';
    let fileBufferBase64 = '';

    // Determine format
    const ext = fileName.split('.').pop().toLowerCase();
    let format = 'pdf';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) format = 'office';
    else if (['cpp', 'py', 'java', 'js', 'sql', 'c', 'h', 'ts', 'html', 'css', 'json'].includes(ext)) format = 'code';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) format = 'image';
    else if (['mp3', 'mp4', 'wav'].includes(ext)) format = 'media';
    else if (ext === 'txt' || ext === 'md') format = 'text';

    if (file && file.buffer) {
      fileBufferBase64 = file.buffer.toString('base64');

      if (ext === 'pdf') {
        dataUrl = `data:application/pdf;base64,${fileBufferBase64}`;
        try {
          const parser = new PDFParse({ data: file.buffer });
          await parser.load();
          const pdfResult = await parser.getText();
          if (pdfResult && pdfResult.text && pdfResult.text.trim().length > 10) {
            if (pdfResult.pages && pdfResult.pages.length > 1) {
              content = pdfResult.pages
                .filter(p => p.text && p.text.trim().length > 0)
                .map((p, idx) => `--- PAGE ${idx + 1} ---\n${p.text.trim()}`)
                .join('\n\n');
            } else {
              content = pdfResult.text.trim();
            }
          }
        } catch (pdfErr) {
          console.warn('[PDFParse] Extraction standard échouée:', pdfErr.message);
        }
      } else if (ext === 'docx') {
        dataUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${fileBufferBase64}`;
        try {
          const mammothResult = await mammoth.extractRawText({ buffer: file.buffer });
          if (mammothResult && mammothResult.value && mammothResult.value.trim().length > 0) {
            content = mammothResult.value.trim();
          }
        } catch (docxErr) {
          console.warn('[Mammoth] Extraction docx échouée:', docxErr.message);
        }
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        const mime = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
        dataUrl = `data:${mime};base64,${fileBufferBase64}`;
      } else if (['txt', 'md', 'cpp', 'py', 'java', 'js', 'sql', 'c', 'h', 'ts', 'html', 'css', 'json'].includes(ext)) {
        content = file.buffer.toString('utf-8');
      }
    }

    if (!content && ext !== 'image') {
      content = `Document académique : ${fileName}\nCe fichier universitaire (${ext.toUpperCase()}) a été importé pour indexation et consultation.`;
    }

    // Create job
    const job = db.addJob({
      fileName,
      fileSize,
      format,
      content,
      dataUrl,
      fileBufferBase64,
      courseId,
      resourceType,
      type: 'INGESTION_FILE'
    });

    // Run synchronous/await through Tri-Agents so it's directly available
    await triAgentsManager.processIngestionJob(job.id, userApiKey);

    const updatedJob = db.data && db.data.jobs ? db.data.jobs.find(j => j.id === job.id) : null;
    const resourceId = (updatedJob && updatedJob.result && updatedJob.result.resourceId) || null;

    res.json({
      success: true,
      message: 'Fichier pris en charge et indexé avec succès par le système Tri-Agents.',
      jobId: job.id,
      resourceId: resourceId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Console Ad-Hoc Commands
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

// User-provided API Key testing
router.post('/user-key/test', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Format de clé API invalide.' });
  }

  const testResult = await geminiService.testKey(apiKey.trim());
  res.json(testResult);
});

export default router;
