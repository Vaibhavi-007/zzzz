const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const fallback = require('../config/storageFallback');
const { getStatus } = require('../config/db');

// Create or retrieve participant
router.post('/', async (req, res) => {
  try {
    const { participantId, condition, stimulusType, ageGroup } = req.body;
    if (!participantId || !participantId.trim()) {
      return res.status(400).json({ error: 'Participant ID is required.' });
    }

    const cleanId = participantId.trim();
    const assignedCondition = condition || ['pleasant', 'neutral', 'unpleasant'][Math.floor(Math.random() * 3)];
    const chosenStimulusType = stimulusType || 'video';

    let participant;
    if (getStatus()) {
      participant = await Participant.findOne({ participantId: cleanId });
      if (!participant) {
        participant = await Participant.create({
          participantId: cleanId,
          assignedCondition,
          stimulusType: chosenStimulusType,
          ageGroup: ageGroup || 'unspecified',
          status: 'registered'
        });
      }
    } else {
      participant = fallback.findOne('participants', { participantId: cleanId });
      if (!participant) {
        participant = fallback.save('participants', {
          participantId: cleanId,
          assignedCondition,
          stimulusType: chosenStimulusType,
          ageGroup: ageGroup || 'unspecified',
          status: 'registered',
          createdAt: new Date().toISOString()
        });
      }
    }

    res.json({ success: true, participant });
  } catch (err) {
    console.error('Participant creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List all participants
router.get('/', async (req, res) => {
  try {
    let participants;
    if (getStatus()) {
      participants = await Participant.find().sort({ createdAt: -1 });
    } else {
      participants = fallback.find('participants');
    }
    res.json({ success: true, participants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
