export const getGroupedTimeLogsWithDateSorted = (timeLogsWithinActiveDate) => {
  const grouped = [];
  timeLogsWithinActiveDate.forEach((dateTimeLog) => {
    let index;
    for (const i in grouped) {
      if (grouped[i][0]?.category?.id === dateTimeLog?.category?.id) {
        if (
          grouped[i][0]?.subcategory === undefined &&
          dateTimeLog?.subcategory === undefined
        ) {
          index = i;
          break;
        }
        if (grouped[i][0]?.subcategory?.id === dateTimeLog?.subcategory?.id) {
          index = i;
          break;
        }
      }
    }
    if (index) {
      grouped[index] = [...grouped[index], dateTimeLog];
    } else {
      grouped.push([dateTimeLog]);
    }
  });
  return grouped
    .map((group) => {
      const category = group[0]?.category;
      const subcategory = group[0]?.subcategory;
      const notFinishedPeriod = group.find(
        (timeLogsWithinDate) => timeLogsWithinDate.ended === false
      );
      const ended = !notFinishedPeriod;
      const totalPeriodInMsWithoutUnfinishedTimeLog = group.reduce(
        (accumulator, currentValue) => {
          if (currentValue.ended) {
            return accumulator + currentValue.periodTotalMs;
          }
          return accumulator;
        },
        0
      );
      return {
        category,
        subcategory,
        notFinishedPeriod,
        ended,
        totalPeriodInMsWithoutUnfinishedTimeLog,
      };
    })
    .sort((a, b) => {
      if (a.ended === false) {
        return -1;
      }
      if (b.ended === false) {
        return 1;
      }
      return (
        b.totalPeriodInMsWithoutUnfinishedTimeLog -
        a.totalPeriodInMsWithoutUnfinishedTimeLog
      );
    });
};
