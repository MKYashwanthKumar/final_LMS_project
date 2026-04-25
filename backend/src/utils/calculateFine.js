function calculateFine(dueDate, returnDate) {
  const finePerDay = Number(process.env.FINE_PER_DAY || 5);

  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const returnedMidnight = new Date(returned.getFullYear(), returned.getMonth(), returned.getDate());

  const diffMs = returnedMidnight - dueMidnight;
  const lateDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lateDays <= 0) {
    return 0;
  }

  return lateDays * finePerDay;
}

module.exports = calculateFine;