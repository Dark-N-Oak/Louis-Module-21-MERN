const { User, Book } = require('../models');
const {AuthenticationError,signToken} = require('../utils/auth')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const secret = 'mysecretsshhhhh'; // Replace with your actual JWT secret

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (!context.user) {
                throw AuthenticationError;
            }
            return User.findById(context.user._id);
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user found with this email');
            }
            const isMatch = await user.isCorrectPassword(password);
            if (!isMatch) {
                throw AuthenticationError;
            }
            const token = signToken(user)
            return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
            //const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ username, email, password});
            const token = signToken(user)
            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (!context.user) {
                throw AuthenticationError;
            }
            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $addToSet: { savedBooks: bookData } },
                { new: true }
            );
            return updatedUser;
        },
        removeBook: async (parent, { bookId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return updatedUser;
        }
    }
};

module.exports = resolvers;
