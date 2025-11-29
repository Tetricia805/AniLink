import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { pushMessageEvent } from '../services/pushService.js';
import { sendUnreadCounts } from '../sockets/socketManager.js';

const ensureParticipant = async (conversationId, userId) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }
  const isParticipant = convo.participants.some(
    (id) => id.toString() === userId.toString()
  );
  if (!isParticipant) {
    const err = new Error('Not part of this conversation');
    err.statusCode = 403;
    throw err;
  }
  return convo;
};

export const createConversation = async (req, res) => {
  try {
    const { participants, channelType } = req.body;
    if (!participants.includes(req.user._id.toString())) {
      participants.push(req.user._id);
    }

    const conversation = await Conversation.create({
      participants: [...new Set(participants)],
      channelType
    });

    return res.status(201).json({
      status: 'success',
      data: { conversation }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email role')
      .sort({ updatedAt: -1 })
      .limit(50);
    return res.status(200).json({
      status: 'success',
      data: { conversations }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const conversation = await ensureParticipant(
      req.params.id,
      req.user._id
    );

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      body: req.body.body,
      attachments: req.body.attachments
    });

    conversation.lastMessage = req.body.body;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await pushMessageEvent(conversation, message);

    return res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listMessages = async (req, res) => {
  try {
    await ensureParticipant(req.params.id, req.user._id);

    const messages = await Message.find({
      conversation: req.params.id
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'name role');

    return res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const markMessagesRead = async (req, res) => {
  try {
    await ensureParticipant(req.params.id, req.user._id);
    await Message.updateMany(
      {
        conversation: req.params.id,
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );
    await sendUnreadCounts(req.user._id.toString());
    return res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

