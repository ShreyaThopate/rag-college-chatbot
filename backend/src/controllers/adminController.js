import { Document } from '../models/Document.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { vectorStore } from '../rag/vectorStore.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDocuments,
      readyDocuments,
      processingDocuments,
      failedDocuments,
      totalUsers,
      totalStudents,
      totalQuestions,
      recentQuestions,
      recentDocuments,
    ] = await Promise.all([
      Document.countDocuments(),
      Document.countDocuments({ processingStatus: 'READY' }),
      Document.countDocuments({ processingStatus: 'PROCESSING' }),
      Document.countDocuments({ processingStatus: 'FAILED' }),
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Message.countDocuments({ role: 'user' }),
      Message.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: 'conversationId',
          populate: { path: 'userId', select: 'name email' },
        }),
      Document.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const vectorStats = vectorStore.getStats();

    res.status(200).json({
      stats: {
        totalDocuments,
        readyDocuments,
        processingDocuments,
        failedDocuments,
        totalUsers,
        totalStudents,
        totalQuestions,
        totalVectors: vectorStats.totalChunks,
      },
      recentQuestions: recentQuestions.map((q) => ({
        _id: q._id,
        content: q.content,
        createdAt: q.createdAt,
        user: q.conversationId?.userId ? q.conversationId.userId.name : 'Student',
      })),
      recentDocuments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
};
