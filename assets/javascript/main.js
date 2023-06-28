const csvUrl = "assets/data/modifiedData.csv";
function parseData(data) {
  // each data is in dd/mm/yyyy format, get last 4 characters of string
  // 01/12/2020 = "2020"
  data.release_date = data.release_date.slice(-4);
  //   convert string to number for sorting
  data.release_date = +data.release_date;
  //   return all data
  return data;
}
// destructing d3 to avoid d3.csv etc.. in code
const { csv } = d3;

// barChart
const barChart = async () => {
  const bardata = await csv(csvUrl, parseData);
  console.log(bardata);
};

barChart();
