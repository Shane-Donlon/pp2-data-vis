const csvUrl = "assets/data/modifiedData.csv";
function parseData(data) {
  // each data is in dd/mm/yyyy format, get last 4 characters of string
  // 01/12/2020 = "2020"
  data.release_date = data.release_date.slice(-4);
  //   convert string to number for sorting
  data.release_date = +data.release_date;
  // convert string to number
  data.budget = +data.budget;
  data.revenue = +data.revenue;
  data.runtime = +data.runtime;
  data.vote_average = +data.vote_average;

  //   return all data
  return data;
}
// destructing d3 to avoid d3.csv etc.. in code
const { csv, group, flatGroup } = d3;

// barChart
const barChart = async () => {
  const bardata = await csv(csvUrl, parseData);
  //   group movies by year in array form then sort smallest to largest
  let moviesByYear = flatGroup(bardata, (d) => d.release_date).sort();
};

barChart();
