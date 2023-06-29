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
const main = async () => {
  const data = await csv(csvUrl, parseData);
  //   group movies by year in array form then sort smallest to largest

  // bar chart movies by Year
  function moviesByYearChart() {
    // Data for Bar Chart on load
    let moviesByYear = flatGroup(data, (d) => d.release_date).sort();
    //   ChartJS Canvas for chart
    let barChartArea = document
      .querySelector("#moviesByYearChart")
      .getContext("2d");

    let dataForMoviesByYearChart = moviesByYear.map((movie, index) => {
      let movieData = {};
      movieData.year = {};
      movieData.count = {};
      movieData.year = movie[0];
      movieData.count = movie[1].length;
      return movieData;
    });
    let moviesReleasedChart = new Chart(barChartArea, {
      type: "bar",
      data: {
        labels: dataForMoviesByYearChart.map((d) => d.year),
        datasets: [
          {
            label: "Movies Released",
            data: dataForMoviesByYearChart.map((d) => d.count),
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Movies by Year all Years",
          },
        },
        indexAxis: "y",
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        responsive: true,
      },
    });
  }
  // functions to call charts
  moviesByYearChart();
};

main();
