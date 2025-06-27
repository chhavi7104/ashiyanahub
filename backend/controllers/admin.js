const User = require('../models/User');
const Property = require('../models/property');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const propertiesCount = await Property.countDocuments();
    const agentsCount = await User.countDocuments({ role: 'agent' });

    const propertiesByType = await Property.aggregate([
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 },
        },
      },
    ]);

    const propertiesByStatus = await Property.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('agent', 'name');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    res.json({
      usersCount,
      propertiesCount,
      agentsCount,
      propertiesByType,
      propertiesByStatus,
      recentProperties,
      recentUsers,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent modifying admin users
    if (user.role === 'admin' && req.user.id !== user._id.toString()) {
      return res.status(401).json({ msg: 'Cannot modify other admin users' });
    }

    user.role = req.body.role;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(401).json({ msg: 'Cannot delete admin users' });
    }

    // Delete user's properties
    await Property.deleteMany({ agent: user._id });

    await user.remove();

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};