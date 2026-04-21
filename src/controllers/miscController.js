import * as MiscService from '../services/miscServices.js';

// Interactions
export const listAllInteractions = async (req, res, next) => {
  try {
    const { page, limit, clientId } = req.query;
    const result = await MiscService.getAllInteractions(
      req.user.firmId,
      Number(page) || 1,
      Number(limit) || 10,
      clientId || null
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const listInteractions = async (req, res, next) => {
  try {
    const result = await MiscService.getInteractionsByClient(req.params.clientId);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createInteraction = async (req, res, next) => {
  try {
    const result = await MiscService.createInteraction({ ...req.body, firm_id: req.user.firmId });
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateInteraction = async (req, res, next) => {
  try {
    const result = await MiscService.updateInteraction(req.params.id, req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteInteraction = async (req, res, next) => {
  try {
    await MiscService.deleteInteraction(req.params.id, req.user.firmId);
    res.json({ status: 'success', message: 'Interaction deleted' });
  } catch (error) {
    next(error);
  }
};

// Reminders
export const listReminders = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await MiscService.getReminders(
      req.user.firmId,
      status,
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createReminder = async (req, res, next) => {
  try {
    const result = await MiscService.createReminder({ ...req.body, firm_id: req.user.firmId });
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateReminder = async (req, res, next) => {
  try {
    const result = await MiscService.updateReminder(req.params.id, req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteReminder = async (req, res, next) => {
  try {
    await MiscService.deleteReminder(req.params.id, req.user.firmId);
    res.json({ status: 'success', message: 'Reminder deleted' });
  } catch (error) {
    next(error);
  }
};

export const toggleReminder = async (req, res, next) => {
  try {
    const result = await MiscService.toggleReminder(req.params.id, req.user.firmId);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

// Documents
export const listDocuments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await MiscService.getDocumentsByClient(
      req.params.clientId,
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const listAllDocuments = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await MiscService.getAllDocuments(
      req.user.firmId,
      Number(page) || 1,
      Number(limit) || 10,
      search
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const listDocumentCategories = async (req, res, next) => {
  try {
    const result = await MiscService.getDocumentCategories(req.user.firmId);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const result = await MiscService.createDocument(req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const result = await MiscService.updateDocument(req.params.id, req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    await MiscService.deleteDocument(req.params.id, req.user.firmId);
    res.json({ status: 'success', message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

// Settings
export const getFirmProfile = async (req, res, next) => {
  try {
    const result = await MiscService.getFirmProfile(req.user.firmId);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateFirmProfile = async (req, res, next) => {
  try {
    const result = await MiscService.updateFirmProfile(req.user.firmId, req.body);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    
    // Update firm logo_url
    const result = await MiscService.updateFirmProfile(req.user.firmId, { 
      logo_url: req.file.path // Cloudinary URL
    });

    res.json({ 
      status: 'success', 
      message: 'Logo uploaded successfully',
      data: result 
    });
  } catch (error) {
    next(error);
  }
};

export const invite = async (req, res, next) => {
  try {
    const { email } = req.body;
    await MiscService.inviteMember(req.user.firmId, email);
    res.json({ status: 'success', message: 'Invite sent' });
  } catch (error) {
    next(error);
  }
};

