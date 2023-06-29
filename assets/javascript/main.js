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
const { csv, flatGroup, flatRollup, extent } = d3;

// barChart
const main = async () => {
  const rawData = await csv(csvUrl, parseData);

  // bar chart movies by Year
  function moviesByYearChart() {
    // Data for Bar Chart on load
    let moviesByYear = flatGroup(rawData, (d) => d.release_date).sort();
    // slider to filter data
    const mbySlider = document.querySelector("#mbySlider");
    let sliderMinMax = extent(rawData, (d) => d.release_date);
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

    let moviesByGenre = flatRollup(
      rawData,
      (v) => v.length,
      (d) => d.release_date,
      (d) => d.genres
    );
    //  returns object for release dates, genres, and sum of genres
    let filteredDataGenres = moviesByGenre.map((movie, index) => {
      let genreData = {};
      genreData.release_date = movie[0];
      genreData.genres = movie[1];
      genreData.genreCount = movie[2];
      return genreData;
    });
    // chart data
    const data = {
      labels: dataForMoviesByYearChart.map((d) => d.year),
      datasets: [
        {
          label: "Movies Released",
          data: dataForMoviesByYearChart.map((d) => d.count),
        },
      ],
    };

    const config = {
      type: "line",
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: "Total Movies Produced By Year",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };
    let moviesReleasedChart = new Chart(barChartArea, config);
    mbySlider.setAttribute("min", sliderMinMax[0]);
    mbySlider.setAttribute("max", sliderMinMax[1]);

    function updateChart(e) {
      let sliderValue = +e.target.value;
      // on input change from line chart to bar chart
      config.type = "bar";
      let result = filteredDataGenres.filter(
        (d) => d.release_date === sliderValue
      );
      moviesReleasedChart.options.plugins.title.text = `Distrbution of Movies by Genre For Year ${sliderValue}`;

      moviesReleasedChart.data.labels = result.map((d) => d.genres);
      moviesReleasedChart.data.datasets[0].data = result.map(
        (d) => d.genreCount
      );

      moviesReleasedChart.update();
    }
    mbySlider.addEventListener("input", updateChart);
  }
  // functions to call charts
  moviesByYearChart();
  function pieChart() {
    let pieChartArea = document
      .querySelector("#languagePieArea")
      .getContext("2d");
    let pieDataOnLoad = flatRollup(
      rawData,
      (v) => v.length,
      (d) => {
        if (d.original_language === "en") {
          return "English";
        } else {
          return "Non-English";
        }
      }
    );
    const data = {
      labels: pieDataOnLoad.map((d) => d[0]),
      datasets: [
        {
          label: "Count of Movies",
          data: pieDataOnLoad.map((d) => d[1]),
        },
      ],
    };
    const config = {
      type: "doughnut",
      data: data,
      options: {
        scales: {},
        responsive: true,

        plugins: {
          title: {
            display: true,
            text: `Movies by language all years`,
          },
        },
      },
    };
    let moviveLanguageChart = new Chart(pieChartArea, config);
  }
  pieChart();
};

main();
