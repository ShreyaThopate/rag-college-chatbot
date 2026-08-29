import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { ChatHistory } from '../models/ChatHistory.js';
import { retrieveContext } from '../rag/retriever.js';
import { generateRAGResponse } from '../rag/generator.js';

/**
 * Handles incoming chat message from a student:
 * 1. Resolves/Creates Conversation with collegeId
 * 2. Saves User message
 * 3. Retrieves semantic context from Vector Store for specific college
 * 4. Generates grounded RAG response
 * 5. Saves Assistant message with sources
 * 6. Returns structured response
 */
export const handleChatMessage = async ({ userId, conversationId, messageContent, collegeId = 'saoe_pune' }) => {
  if (!messageContent || messageContent.trim().length === 0) {
    const error = new Error('Message content cannot be empty.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Resolve or create conversation
  let conversation = null;
  let activeCollegeId = collegeId || 'saoe_pune';

  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (conversation?.collegeId) {
      activeCollegeId = conversation.collegeId;
    }
  }

  if (!conversation) {
    const titleSnippet = messageContent.trim().slice(0, 40) + (messageContent.length > 40 ? '...' : '');
    conversation = await Conversation.create({
      userId,
      collegeId: activeCollegeId,
      title: titleSnippet,
    });
  }

  // 2. Save student message
  const userMessage = await Message.create({
    conversationId: conversation._id,
    role: 'user',
    content: messageContent.trim(),
  });

  // 3. Load recent conversation history (up to last 6 messages)
  const historyDocs = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(6);
  const history = historyDocs
    .reverse()
    .filter((m) => m._id.toString() !== userMessage._id.toString())
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  // 4. Retrieve semantically relevant context chunks strictly from the selected college
  const retrievedChunks = await retrieveContext(messageContent.trim(), {
    topK: 5,
    collegeId: activeCollegeId,
  });

  // 5. Generate Grounded RAG response
  const { answer, sources, found } = await generateRAGResponse(
    messageContent.trim(),
    retrievedChunks,
    history,
    activeCollegeId
  );

  const topScore = sources.length > 0 ? Math.max(...sources.map((s) => s.score || 0)) : 0;

  // 6. Save assistant message
  const assistantMessage = await Message.create({
    conversationId: conversation._id,
    role: 'assistant',
    content: answer,
    sources,
    retrievalScore: topScore,
    found,
  });

  // 7. Save to ChatHistory log collection for historical analytics & compliance
  ChatHistory.create({
    userId,
    conversationId: conversation._id,
    collegeId: activeCollegeId,
    userQuery: messageContent.trim(),
    assistantResponse: answer,
    sources,
    retrievalScore: topScore,
    found,
  }).catch((err) => {
    console.warn('[ChatService] Failed to record audit log in ChatHistory:', err.message);
  });

  // Update conversation timestamp
  conversation.updatedAt = new Date();
  await conversation.save();

  return {
    conversationId: conversation._id.toString(),
    collegeId: activeCollegeId,
    answer,
    sources,
    found,
    messageId: assistantMessage._id.toString(),
  };
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId, collegeId = null) => {
  const query = { userId };
  if (collegeId && collegeId !== 'All') {
    query.collegeId = collegeId;
  }
  return await Conversation.find(query).sort({ updatedAt: -1 });
};

/**
 * Get single conversation with all its messages
 */
export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  return {
    conversation,
    messages,
  };
};

/**
 * Delete a conversation and its messages
 */
export const deleteConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findOneAndDelete({ _id: conversationId, userId });
  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.statusCode = 404;
    throw error;
  }

  await Message.deleteMany({ conversationId });
  return { message: 'Conversation deleted successfully.' };
};
