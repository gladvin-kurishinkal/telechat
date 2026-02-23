const User = require('../models/User');

exports.searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q
            ? {
                $or: [
                    { username: { $regex: req.query.q, $options: 'i' } },
                    { email: { $regex: req.query.q, $options: 'i' } },
                ],
            }
            : {};

        // Find users matching query, exclude the current logged-in user, and don't return passwords
        const users = await User.find(keyword)
            .find({ _id: { $ne: req.user._id } })
            .select('-password');

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
