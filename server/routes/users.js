const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const DEFAULT_SUGGESTION_LIMIT = 6;
const MAX_SUGGESTION_LIMIT = 12;

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getRequesterUserId = (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || null;
  } catch (error) {
    return null;
  }
};

const toSafeRegex = (value) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Something went wrong'
    });
  }
});

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, bio, location } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Something went wrong'
    });
  }
});

// Add skill to user profile
router.post('/skills', [
  authenticateToken,
  body('name').notEmpty().trim().withMessage('Skill name is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid skill level'),
  body('description').optional().trim().isLength({ max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, level, description } = req.body;

    // Check if skill already exists
    const existingSkill = req.user.skills.find(skill => 
      skill.name.toLowerCase() === name.toLowerCase()
    );

    if (existingSkill) {
      return res.status(400).json({
        error: 'Skill already exists',
        message: 'This skill is already in your profile'
      });
    }

    req.user.skills.push({ name, level, description: description || '' });
    await req.user.save();

    res.json({
      message: 'Skill added successfully',
      user: req.user.getPublicProfile()
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      error: 'Failed to add skill',
      message: 'Something went wrong'
    });
  }
});

// Remove skill from user profile
router.delete('/skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const { skillId } = req.params;
    
    req.user.skills = req.user.skills.filter(skill => 
      skill._id.toString() !== skillId
    );
    
    await req.user.save();

    res.json({
      message: 'Skill removed successfully',
      user: req.user.getPublicProfile()
    });

  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({
      error: 'Failed to remove skill',
      message: 'Something went wrong'
    });
  }
});

// Search users by skills
router.get('/search', async (req, res) => {
  try {
    const { skill, location, limit = DEFAULT_SUGGESTION_LIMIT, page = 1 } = req.query;
    const trimmedSkill = (skill || '').trim();
    const trimmedLocation = (location || '').trim();
    const hasSkill = Boolean(trimmedSkill);
    const hasLocation = Boolean(trimmedLocation);
    const safeLimit = Math.min(parsePositiveInt(limit, DEFAULT_SUGGESTION_LIMIT), MAX_SUGGESTION_LIMIT);
    const safePage = parsePositiveInt(page, 1);
    const skip = (safePage - 1) * safeLimit;
    const requesterUserId = getRequesterUserId(req);

    const query = {};

    query.isVerified = true;

    if (requesterUserId) {
      query._id = { $ne: requesterUserId };
    }

    if (hasSkill) {
      query['skills.name'] = { $regex: trimmedSkill, $options: 'i' };
    }

    if (!hasSkill && hasLocation) {
      query.location = { $regex: trimmedLocation, $options: 'i' };
    }

    if (hasSkill) {
      const aggregation = [
        { $match: query },
        {
          $addFields: {
            matchPriority: hasLocation
              ? {
                  $cond: [
                    {
                      $regexMatch: {
                        input: { $ifNull: ['$location', ''] },
                        regex: toSafeRegex(trimmedLocation)
                      }
                    },
                    0,
                    1
                  ]
                }
              : 1
          }
        },
        { $sort: { matchPriority: 1, lastActive: -1, createdAt: -1 } },
        {
          $facet: {
            results: [
              { $skip: skip },
              { $limit: safeLimit },
              {
                $project: {
                  password: 0,
                  otp: 0
                }
              }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ];

      const [aggregated] = await User.aggregate(aggregation);
      const users = aggregated?.results || [];
      const total = aggregated?.totalCount?.[0]?.count || 0;

      const bestMatches = hasLocation
        ? users.filter((user) => user.matchPriority === 0).map((user) => {
            const { matchPriority, ...rest } = user;
            return rest;
          })
        : [];

      const otherMatches = users
        .filter((user) => !hasLocation || user.matchPriority === 1)
        .map((user) => {
          const { matchPriority, ...rest } = user;
          return rest;
        });

      const cleanUsers = users.map((user) => {
        const { matchPriority, ...rest } = user;
        return rest;
      });

      return res.json({
        users: cleanUsers,
        bestMatches,
        otherMatches,
        pagination: {
          currentPage: safePage,
          totalPages: Math.ceil(total / safeLimit),
          totalUsers: total,
          hasNext: skip + users.length < total,
          hasPrev: safePage > 1,
          limit: safeLimit
        }
      });
    }

    const users = await User.find(query)
      .select('-password -otp')
      .limit(safeLimit)
      .skip(skip)
      .sort({ lastActive: -1, createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: safePage > 1,
        limit: safeLimit
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Something went wrong'
    });
  }
});

// Get user by ID (public profile)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -otp');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'Something went wrong'
    });
  }
});

module.exports = router; 