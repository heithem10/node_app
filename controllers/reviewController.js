const Review = require("../models/reviewModel")
const Product = require("../models/productModel")
const CustomError = require("../errors")
const { StatusCodes } = require("http-status-codes")
const { checkPermissions } = require("../utils")

// ** ===================  CREATE REVIEW  ===================
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params; // Assuming productId is passed in params or body
    const userId = req.user.userId; 
    console.log(userId)// Assuming userId is retrieved from authenticated user
    if (!userId) {
      throw new CustomError.UnauthorizedError('User not authenticated');
    }
    const review = await Review.create({
      title:"Review",
      rating,
      comment,
      user: userId,
      product: productId,
    });

    res.status(StatusCodes.CREATED).json({ review });
  } catch (error) {
    next(error);
  }
};

// ** ===================  GET ALL REVIEWS  ===================
const getAllReviews = async (req, res) => {
  const review = await Review.find({}).populate({
    path: "product",
    select: "name company, price",
  })
  res.status(StatusCodes.OK).json({ total_review: review.length, review })
}

// ** ===================  GET SINGLE REVIEW  ===================
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError(`No review with the the id ${reviewId}`)
  }
  res.status(StatusCodes.OK).json({ review })
}

// Update an existing review
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params; // Assuming reviewId is passed in params
    const { rating, comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) {
      return next(new CustomError.NotFoundError(`Review with id ${reviewId} not found`));
    }

    res.status(StatusCodes.OK).json({ review });
  } catch (error) {
    next(error);
  }
};
// ** ===================  DELETE REVIEW  ===================
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError(`No review with the the id ${reviewId}`)
  }
  checkPermissions(req.user, review.user)
  await review.remove()
  res.status(StatusCodes.OK).json({ msg: "Success! Review has been deleted" })
}

// ** =================== GET SINGLE PRODUCT REVIEW  ===================
const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params
  const reviews = await Review.find({ product: productId }).populate('user', 'name');
  res.status(StatusCodes.OK).json({ total_reviews: reviews.length, reviews })
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
}
