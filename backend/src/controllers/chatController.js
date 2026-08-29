import * as chatService from '../services/chatService.js';

export const postMessage = async (req, res, next) => {
  try {
    const { conversationId, message, collegeId } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'The message field is required.' });
    }

    const result = await chatService.handleChatMessage({
      userId: req.user._id,
      conversationId,
      messageContent: message,
      collegeId: collegeId || 'saoe_pune',
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { collegeId } = req.query;
    const conversations = await chatService.getUserConversations(req.user._id, collegeId);
    res.status(200).json({ conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const data = await chatService.getConversationById(req.params.id, req.user._id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const result = await chatService.deleteConversation(req.params.id, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
