const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  totalTasksCompleted: {
    type: Number,
    default: 0
  },
  lastCompletedTaskDate: {
    type: Date,
    default: null
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  }
});

// Method to update streaks and last completed task date
userSchema.methods.updateStreaks = async function () {
  // Update totalTasksCompleted
  this.totalTasksCompleted += 1;

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if lastCompletedTaskDate is earlier than today
  if (!this.lastCompletedTaskDate || this.lastCompletedTaskDate < today) {
    // If the last completed task was not today, update streaks
    if (
      this.lastCompletedTaskDate &&
      today - this.lastCompletedTaskDate === 86400000 // 24 hours in milliseconds
    ) {
      // If last completed task was earlier today, increment current streak
      this.currentStreak += 1;
    } else {
      // If last completed task was not today, reset current streak to 1
      this.currentStreak = 1;
    }

    // Update longest streak if current streak is greater
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }

    // Update last completed task date to today
    this.lastCompletedTaskDate = today;
  }

  // Save changes to the user
  await this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
