import Review from "../models/review.js";
import Complaint from "../models/ComplaintModel.js";
import AppError from "../utils/AppError.js";

/**
 * Submits a new review for a resolved or closed complaint.
 * @param {string} userId - User ID submitting the review.
 * @param {string} complaintId - Target complaint ID.
 * @param {Object} data - Review data containing ratings and feedback.
 */
export const submitReviewService = async (userId, complaintId, data) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new AppError("Complaint not found", 404);
  if (complaint.status !== "resolved" && complaint.status !== "closed") {
    throw new AppError("Can only review resolved or closed complaints", 400);
  }

  const existingReview = await Review.findOne({ complaintId });
  if (existingReview) {
    throw new AppError("Review already submitted for this complaint", 400);
  }

  const review = await Review.create({
    userID: userId,
    complaintId,
    ratings: data.ratings,
    feedback: data.feedback
  });

  return review;
};

/**
 * Retrieves review details for a given complaint.
 * @param {string} complaintId - Target complaint ID.
 */
export const getReviewService = async (complaintId) => {
  const review = await Review.findOne({ complaintId }).populate(
    "userID",
    "Name Email"
  );
  return review;
};
