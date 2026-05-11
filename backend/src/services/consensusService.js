const User = require('../models/User');

// Returns total number of active validators (admin + faculty with isValidator=true)
async function getValidatorCount() {
  return await User.countDocuments({ isValidator: true });
}

// Returns required approvals: floor(N/2) + 1
async function getRequiredApprovals() {
  const total = await getValidatorCount();
  return Math.floor(total / 2) + 1;
}

// Check if approvalCount meets majority threshold
async function hasMajority(approvalCount) {
  const required = await getRequiredApprovals();
  return approvalCount >= required;
}

// Check if rejection is impossible (remaining votes can't flip outcome)
async function isRejectedByMajority(rejectCount) {
  const required = await getRequiredApprovals();
  return rejectCount >= required;
}

module.exports = { getValidatorCount, getRequiredApprovals, hasMajority, isRejectedByMajority };
