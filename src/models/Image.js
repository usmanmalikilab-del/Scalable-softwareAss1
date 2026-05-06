/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       required:
 *         - title
 *         - url
 *         - publicId
 *         - creatorId
 *       properties:
 *         id:
 *           type: string
 *           description: Image unique identifier
 *         title:
 *           type: string
 *           maxLength: 120
 *           description: Image title
 *         caption:
 *           type: string
 *           maxLength: 500
 *           description: Image description or caption
 *         location:
 *           type: string
 *           maxLength: 120
 *           description: Where the photo was taken
 *         people:
 *           type: array
 *           items:
 *             type: string
 *           description: People tagged in the photo
 *         url:
 *           type: string
 *           format: uri
 *           description: CDN URL of the uploaded image
 *         publicId:
 *           type: string
 *           description: Cloudinary public ID for image management
 *         creatorId:
 *           type: string
 *           description: ID of the user who uploaded the image
 *         averageRating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: Average rating of the image
 *         ratingCount:
 *           type: integer
 *           minimum: 0
 *           description: Number of ratings received
 *         commentCount:
 *           type: integer
 *           minimum: 0
 *           description: Number of comments received
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Image upload timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ''
    },
    people: {
      type: [String],
      default: []
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    averageRating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

imageSchema.index({ title: 'text', caption: 'text' });
imageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Image', imageSchema);
