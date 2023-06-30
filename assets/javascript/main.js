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
  let sliderMinMax = extent(rawData, (d) => d.release_date);
  // bar chart movies by Year
  function moviesByYearChart() {
    // Data for Bar Chart on load
    let moviesByYear = flatGroup(rawData, (d) => d.release_date).sort();
    // slider to filter data
    const mbySlider = document.querySelector("#mbySlider");

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
    // table
    let mbyTableWrapper = document.querySelector(".mby-table-wrapper");
    let mbyTableHtml = `
    <table class="visually-hidden" tabindex="0">
    <thead>
      <tr>
        <th>Year</th>
        <th>Count of Movies</th>
      </tr>
    </thead>
    <tbody>
`;

    for (movies of dataForMoviesByYearChart) {
      let mbyTableRow = `
    <tr class="mbyTableRow">
      <td>${movies.year}</td>
      <td>${movies.count}</td>
    </tr>
  `;
      mbyTableHtml += mbyTableRow;
    }
    mbyTableHtml += `
  </tbody>
</table>
`;
    mbyTableWrapper.innerHTML = mbyTableHtml;
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
      // sr only table on change
      mbyTableWrapper.innerHTML = null;
      mbyTableHtml = `
        <table class="visually-hidden" tabindex="0">
          <thead>
            <tr>
              <th>Year</th>
              <th>Genre</th>
              <th>Count of movies in Genre</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (movies of result) {
        mbyTableRow = `
          <tr class="mbyTableRow">
            <td>${movies.release_date}</td>
            <td>${movies.genres}</td>
            <td>${movies.genreCount}</td>
          </tr>
        `;
        mbyTableHtml += mbyTableRow;
      }
      mbyTableHtml += `
        </tbody>
      </table>
      `;
      mbyTableWrapper.innerHTML = mbyTableHtml;
      moviesReleasedChart.update();
    }
    mbySlider.addEventListener("input", updateChart);
  }

  // pieChart start
  function pieChart() {
    let pieChartSlider = document.querySelector(".languagePieSlider");
    pieChartSlider.setAttribute("min", sliderMinMax[0]);
    pieChartSlider.setAttribute("max", sliderMinMax[1]);
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

    let pieDataForInput = flatRollup(
      rawData,
      (v) => v.length,
      (d) => d.release_date,
      (d) => {
        if (d.original_language === "en") {
          return "English";
        } else {
          return "Non-English";
        }
      }
    );
    let pieDataOnInput = pieDataForInput.map((language, index) => {
      let moviesData = {};
      moviesData.year = {};
      moviesData.language = {};
      moviesData.languageCount = {};
      moviesData.year = language[0];
      moviesData.language = language[1];
      moviesData.languageCount = language[2];
      return moviesData;
    });

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
    // sr only table on load
    let languagePieTableWrapper = document.querySelector(
      ".languagePie-table-wrapper"
    );
    let languagePieTableHtml = `
    <table class="visually-hidden" tabindex="0">
    <thead>
      <tr>
        <th>Language</th>
        <th>Count of Movies</th>
      </tr>
    </thead>
    <tbody>
`;

    for (movies of pieDataOnLoad) {
      let languagePieTableRow = `
    <tr class="mbyTableRow">
      <td>${movies[0]}</td>
      <td>${movies[1]}</td>
    </tr>
  `;
      languagePieTableHtml += languagePieTableRow;
    }
    languagePieTableHtml += `
  </tbody>
</table>
`;
    languagePieTableWrapper.innerHTML = languagePieTableHtml;
    function updatePieChart(e) {}

    let moviveLanguageChart = new Chart(pieChartArea, config);
    languagePieSlider.addEventListener("input", (e) => {
      let sliderValue = +e.target.value;
      let result = pieDataOnInput.filter((d) => d.year === sliderValue);
      moviveLanguageChart.options.plugins.title.text = `Movies by language for year ${sliderValue}`;
      moviveLanguageChart.data.labels = result.map((d) => d.language);
      moviveLanguageChart.data.datasets[0].data = result.map(
        (d) => d.languageCount
      );
      languagePieTableHtml = `
      <table class="visually-hidden" tabindex="0">
      <thead>
        <tr>
          <th>Year</th>
          <th>Language</th>
          <th>Count of Movies</th>
        </tr>
      </thead>
      <tbody>
  `;

      for (movies of pieDataOnInput) {
        languagePieTableRow = `
      <tr class="mbyTableRow">
        <td>${sliderValue}</td>
        <td>${movies.language}</td>
        <td>${movies.languageCount}</td>
      </tr>
    `;
        languagePieTableHtml += languagePieTableRow;
      }
      languagePieTableHtml += `
    </tbody>
  </table>
  `;
      languagePieTableWrapper.innerHTML = languagePieTableHtml;
      moviveLanguageChart.update();
    });
  }

  function revBudget() {
    let revBudgetArea = document
      .querySelector("#revBudgetArea")
      .getContext("2d");
    let scatterRaw = flatRollup(
      rawData,
      (v) => v.length,

      (d) => {
        if (d.budget != 0) {
          return d.budget;
        }
      },
      (d) => {
        if (d.revenue != 0) {
          return d.revenue;
        }
      }
    );

    let scatterDataOnInput = flatRollup(
      rawData,
      (v) => v.length,
      (d) => d.release_date,
      (d) => {
        if (d.budget != 0) {
          return d.budget;
        }
      },
      (d) => {
        if (d.revenue != 0) {
          return d.revenue;
        }
      }
    );
    let scatterDataforInputChart = scatterDataOnInput.map((language, index) => {
      let moviesData = {};
      moviesData.year = {};
      moviesData.x = {};
      moviesData.y = {};
      moviesData.year = language[0];
      moviesData.x = language[1];
      moviesData.y = language[2];
      return moviesData;
    });

    let scatterDataOnLoad = scatterRaw.map((movie, index) => {
      let movieData = {};
      movieData.x = {};
      movieData.y = {};
      // FIXME: remove if not using bubble
      // moviedata.r is used for Bubble
      // movieData.r = {};
      // movieData.r = 15;
      movieData.x = movie[0];
      movieData.y = movie[1];
      return movieData;
    });

    const data = {
      datasets: [
        {
          label: "Distribution of Budget & Revenue for All Years",
          data: scatterDataOnLoad,
        },
      ],
    };
    const config = {
      type: "scatter",
      data: data,
      options: {
        scales: {
          x: {
            grid: {
              display: false,
            },
            display: true,
            // FIXME: consider removing log scales
            type: "logarithmic",
          },
          y: {
            grid: {
              display: false,
            },
          },
        },
        responsive: true,
      },
    };
    let revBudgetTableWrapper = document.querySelector(
      ".revBudget-table-wrapper"
    );
    let revBudgetTableHtml = `
    <table class="visually-hidden" tabindex="0">
    <thead>
      <tr>
        <th>Revenue</th>
        <th>Budget</th>
        <th>Difference</th>
      </tr>
    </thead>
    <tbody>
`;

    for (movies of scatterDataOnLoad) {
      if (movies.x != undefined && movies.y != undefined) {
        let revBudgetTableRow = `
    <tr class="mbyTableRow">
      <td>${movies.x}</td>
      <td>${movies.y}</td>
      <td>${movies.x - movies.y}</td>
    </tr>
  `;

        revBudgetTableHtml += revBudgetTableRow;
      }
    }
    revBudgetTableHtml += `
  </tbody>
</table>
`;
    revBudgetTableWrapper.innerHTML = revBudgetTableHtml;

    let scatterChart = new Chart(revBudgetArea, config);
    let revBudgetSlider = document.querySelector(".revBudgetSlider");
    revBudgetSlider.setAttribute("min", sliderMinMax[0]);
    revBudgetSlider.setAttribute("max", sliderMinMax[1]);
    revBudgetSlider.addEventListener("input", (e) => {
      let sliderValue = +e.target.value;
      let result = scatterDataforInputChart.filter(
        (d) => d.year === sliderValue
      );
      scatterChart.data.datasets[0].label = `Distribution of Budget & Revenue for year ${sliderValue}`;
      scatterChart.data.datasets[0].data = result;
      scatterChart.options.scales.x.type = "linear";
      scatterChart.update();
    });
  }
  // functions to call charts
  moviesByYearChart();
  pieChart();
  revBudget();
};

main();
