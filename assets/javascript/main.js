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
  const prefersReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
  let chartColors = [
    "#f5cc01",
    "#f0a52e",
    "#f46928",
    "#b31326",
    "#be1856",
    "#d84c7b",
    "#a38cd7",
    "#7030a0",
    "#b9d238",
    "#00a23a",
    "#105547",
    "#01aaca",
    "#12739f",
    "#0e497d",
    "#37264f",
    "#512a5a",
  ];

  // bar chart movies by Year
  function moviesByYearChart() {
    Chart.defaults.color = "#ffffff";
    // Data for Bar Chart on load
    let moviesByYear = flatGroup(rawData, (d) => d.release_date).sort();
    // slider to filter data
    const mbySlider = document.querySelector("#mbySlider");

    // set font size for all charts responsive text JS Media Query see event listener at end also
    chartFontSize();

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
    // function placed here to get data
    function moviesByYearIncrementCounter() {
      let movieYears = [];
      let counter = document.querySelector(".counter");
      counter.innerText = "0";
      dataForMoviesByYearChart.map((year) => {
        movieYears.push(year);
      });
      let numberOfMovies = movieYears.length - 1;
      counter.setAttribute("data-years", numberOfMovies);
      counter.setAttribute("aria-label", numberOfMovies);

      const incrementCounter = () => {
        let target = +counter.getAttribute("data-years");
        let increment = target / 1000;
        let currentNumber = +counter.textContent;
        if (currentNumber < target) {
          counter.innerText = `${Math.ceil(currentNumber + increment)}`;

          setTimeout(incrementCounter, 400);
        } else {
          counter.innerText = target;
        }
      };

      if (!!prefersReducedMotion) {
        counter.innerText = numberOfMovies;
      } else {
        incrementCounter();
      }
    }
    moviesByYearIncrementCounter();

    function numberOfMoviesIncrementCounter() {
      let counter = document.querySelector(".number-of-movies-span");
      counter.innerText = "0";
      let numberOfMoviesInDatabase = 0;
      rawData.forEach((e) => {
        ++numberOfMoviesInDatabase;
      });

      let numberOfMovies = numberOfMoviesInDatabase;
      counter.setAttribute("data-movies", numberOfMoviesInDatabase);
      counter.setAttribute("aria-label", numberOfMoviesInDatabase);

      const incrementCounter = () => {
        let target = +counter.getAttribute("data-movies");
        let increment = target / 950;
        let currentNumber = +counter.textContent;
        if (currentNumber < target) {
          counter.innerText = `${Math.ceil(currentNumber + increment)}`;

          setTimeout(incrementCounter, 1);
        } else {
          counter.innerText = target;
        }
      };

      if (!!prefersReducedMotion) {
        counter.innerText = numberOfMovies;
      } else {
        incrementCounter();
      }
    }
    numberOfMoviesIncrementCounter();

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
          data: dataForMoviesByYearChart.map((d) => d.count),
          borderColor: chartColors[0],
          backgroundColor: chartColors[0],
        },
      ],
    };

    const customToolTip = (tooltipItems) => {
      return `Movies Released: ${data.datasets[0].data[tooltipItems.parsed.x]}`;
    };
    const config = {
      type: "line",
      data: data,
      options: {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            interaction: {
              // returns index for items to be used to index x axis to get year / genre
              intersect: false,
              mode: "index",
            },
            hover: {
              // hover anywhere on chart to get tooltip to show by year
              intersect: false,
              mode: "index",
            },
            callbacks: {
              label: customToolTip,
            },
          },
          title: {
            display: true,
            text: "Total Movies Released By Year",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    // table
    let mbyTableWrapper = document.querySelector(".mby-table-wrapper");
    let mbyTableHtml = `
    <table class="visually-hidden table" tabindex="0">
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
    // calling chart creation
    let moviesReleasedChart = new Chart(barChartArea, config);

    mbySlider.setAttribute("min", sliderMinMax[0]);
    mbySlider.setAttribute("max", sliderMinMax[1]);

    function updateChart(e) {
      let sliderValue = +e.target.value;
      // on input change from line chart to bar chart
      config.type = "bar";
      // stop bar chart bars bleeding into yAxis area
      config.options.scales.x.offset = true;

      let result = filteredDataGenres.filter(
        (d) => d.release_date === sliderValue
      );
      moviesReleasedChart.options.plugins.title.text = `Distrbution of Movies by Genre For Year ${sliderValue}`;
      (moviesReleasedChart.data.datasets[0].borderColor = chartColors),
        (moviesReleasedChart.data.datasets[0].backgroundColor = chartColors),
        (moviesReleasedChart.data.labels = result.map((d) => d.genres));
      moviesReleasedChart.data.datasets[0].data = result.map(
        (d) => d.genreCount
      );
      // sr only table on change
      mbyTableWrapper.innerHTML = null;
      mbyTableHtml = `
      <table class="visually-hidden table" tabindex="0">
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
    let mbyButton = document.querySelector(".resetmoviesByYearChart");
    let mbycanvasWrapper = document.querySelector(
      ".canvas-wrapper-moviesByYearChart"
    );
    // btn to reset chart
    mbyButton.addEventListener("click", () => {
      mbySlider.value = sliderMinMax[0];
      mbycanvasWrapper.innerHTML = null;
      mbycanvasWrapper.innerHTML = `<canvas id="moviesByYearChart"></canvas>`;
      moviesByYearChart();
    });
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
          // borderColor English, non-English
          borderColor: ["#12739f", chartColors[5]],
          backgroundColor: ["#12739f", chartColors[5]],
        },
      ],
    };
    const config = {
      type: "doughnut",
      data: data,
      options: {
        scales: {},
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          labels: {
            render: "percentage",
            fontSize: 16,
            fontColor: "#fff",
          },
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
    <table class="visually-hidden table" tabindex="0">
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

    let moviveLanguageChart = new Chart(pieChartArea, config);
    let resetlanguagePieChartBtn = document.querySelector(
      ".resetlanguagePieChart"
    );
    let languagePieCanvasWrapper = document.querySelector(
      ".language-pie-canvas-wrapper"
    );
    // btn to reset chart
    resetlanguagePieChartBtn.addEventListener("click", () => {
      languagePieSlider.value = sliderMinMax[0];
      languagePieCanvasWrapper.innerHTML = null;
      languagePieCanvasWrapper.innerHTML = `<canvas id="languagePieArea"></canvas>`;
      pieChart();
    });
    languagePieSlider.addEventListener("input", (e) => {
      let sliderValue = +e.target.value;
      let result = pieDataOnInput.filter((d) => d.year === sliderValue);
      moviveLanguageChart.options.plugins.title.text = `Movies by language for year ${sliderValue}`;
      moviveLanguageChart.data.labels = result.map((d) => d.language);
      moviveLanguageChart.data.datasets[0].data = result.map(
        (d) => d.languageCount
      );
      languagePieTableHtml = `
      <table class="visually-hidden table" tabindex="0">
      <thead>
        <tr>
          <th>Year</th>
          <th>Language</th>
          <th>Count of Movies</th>
        </tr>
      </thead>
      <tbody>
  `;

      for (movies of result) {
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
      (d) => d.vote_average,
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
      (d) => d.vote_average,
      (d) => {
        if (d.revenue != 0) {
          return d.revenue;
        }
      }
    );
    let scatterDataforInputChart = scatterDataOnInput.map((movie, index) => {
      let moviesData = {};
      moviesData.year = {};
      moviesData.x = {};
      moviesData.y = {};
      moviesData.year = movie[0];
      moviesData.y = movie[1];
      moviesData.x = movie[2];
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
      // movie[0] is budget
      movieData.y = movie[0];
      // movie[1] is revenue
      movieData.x = movie[1];
      return movieData;
    });

    const data = {
      datasets: [
        {
          label: "Vote Average & Revenue for All Years",
          data: scatterDataOnLoad,
          borderColor: chartColors,
          backgroundColor: chartColors,
        },
      ],
    };

    function formatDollarxAxis(value, index, ticks) {
      return (
        "$" + Chart.Ticks.formatters.numeric.apply(this, [value, index, ticks])
      );
    }

    const config = {
      type: "scatter",
      data: data,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Revenue",
            },
            ticks: {
              callback: formatDollarxAxis,
            },
            grid: {
              display: false,
            },
            display: true,
            // FIXME: consider removing log scales
            type: "logarithmic",
          },
          y: {
            title: {
              display: true,
              text: "Vote Avg",
            },
            grid: {
              display: false,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
    let revBudgetTableWrapper = document.querySelector(
      ".revBudget-table-wrapper"
    );
    let revBudgetTableHtml = `
    <table class="visually-hidden table" tabindex="0">
    <thead>
      <tr>
        <th>Revenue</th>
        <th>Vote Average</th>
      </tr>
    </thead>
    <tbody>
`;

    for (movies of scatterDataOnLoad) {
      // movies.x = budget movies.y = revenue
      if (movies.x != undefined && movies.y != undefined) {
        let revBudgetTableRow = `
    <tr class="mbyTableRow">
      <td>${movies.x}</td>
      <td>${movies.y}</td>
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
    let revBudgetResetBtn = document.querySelector(".resetrevBudgetChart");
    let revBudgetCanvasWrapper = document.querySelector(
      ".revBudget-canvas-wrapper"
    );
    revBudgetResetBtn.addEventListener("click", () => {
      revBudgetSlider.value = sliderMinMax[0];
      revBudgetCanvasWrapper.innerHTML = null;
      revBudgetCanvasWrapper.innerHTML = `<canvas id="revBudgetArea"></canvas>`;
      revBudget();
    });

    revBudgetSlider.addEventListener("input", (e) => {
      let sliderValue = +e.target.value;
      let result = scatterDataforInputChart.filter(
        (d) => d.year === sliderValue
      );
      scatterChart.data.datasets[0].label = `Vote Average & Revenue for year ${sliderValue}`;
      scatterChart.data.datasets[0].data = result;
      // scatterChart.options.scales.x.type = "linear";
      scatterChart.update();
      revBudgetTableHtml = `
      <table class="visually-hidden table" tabindex="0">
    <thead>
      <tr>
        <th>Year</th>
        <th>Revenue</th>
        <th>Vote Average</th>
      </tr>
    </thead>
    <tbody>
`;

      for (movies of result) {
        // movies.x = budget movies.y = revenue
        if (movies.x != undefined && movies.y != undefined) {
          let revBudgetTableRow = `
    <tr class="mbyTableRow">
      <td>${sliderValue}</td>
      <td>${movies.x}</td>
      <td>${movies.y}</td>
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
    });

    let accessbilityTables = document.querySelectorAll(".table-wrapper");
    let tablesHidden = document.querySelector(".tablesHidden");
    let tablesShown = document.querySelector(".tablesShown");
    let radioWrapperHidden = document.querySelector(".radio-wrapper-hidden");
    let radioWrapperShown = document.querySelector(".radio-wrapper-shown");
    let savePreferencs = document.querySelector(".savePreferences");

    function checkAccessibilityPreferences() {
      if (localStorage.getItem("accessbilityTables") === "shown") {
        radioWrapperShown.classList.add("display-none");
        radioWrapperHidden.classList.remove("display-none");
        accessbilityTables.forEach((table) => {
          table.classList.remove("display-none");
        });
      } else if (localStorage.getItem("accessbilityTables") === "hidden") {
        radioWrapperHidden.classList.add("display-none");
        radioWrapperShown.classList.remove("display-none");
        accessbilityTables.forEach((table) => {
          table.classList.add("display-none");
        });
      }
    }

    savePreferencs.addEventListener("click", saveAccessilbityPreferences);
    function saveAccessilbityPreferences() {
      if (tablesShown.checked === true) {
        localStorage.setItem("accessbilityTables", "shown");
        radioWrapperShown.classList.add("display-none");
        radioWrapperHidden.classList.remove("display-none");
        accessbilityTables.forEach((table) => {
          table.classList.remove("display-none");
        });
        tablesShown.checked = false;
      }
      if (tablesHidden.checked === true) {
        localStorage.setItem("accessbilityTables", "hidden");
        radioWrapperHidden.classList.add("display-none");
        radioWrapperShown.classList.remove("display-none");
        tablesHidden.checked = false;
      }
      checkAccessibilityPreferences();
    }
    checkAccessibilityPreferences();
  }

  // responsive text JS Media Query
  window.addEventListener("resize", chartFontSize);

  function chartFontSize() {
    let windowWidth = window.outerWidth;
    if (windowWidth > 900) {
      Chart.defaults.plugins.title.font.size = 40;
    } else if (windowWidth <= 900 && windowWidth > 600) {
      Chart.defaults.plugins.title.font.size = 20;
    } else if (windowWidth <= 600 && windowWidth >= 320) {
      Chart.defaults.plugins.title.font.size = 10;
    } else {
      Chart.defaults.plugins.title.font.size = 5;
    }
  }

  // functions to call charts

  moviesByYearChart();
  pieChart();
  revBudget();
};

main();
