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
const { csv, flatGroup, flatRollup, extent, mean, sum } = d3;

const main = async () => {
  let rawData;
  try {
    // test rawData for errors
    rawData = await csv(csvUrl, parseData);
  } catch (error) {
    // if error remove display none from error wrapper and input the text of the error message into the browswer
    let errorWrapper = document.querySelector(".error-wrapper");
    let errorDetails = document.querySelector(".error-details");
    errorWrapper.innerHTML = `<h2 class="error-message h2 erorrh2">
    An Error has occured, please refersh your browser
  </h2>
  <h3 class="error-details h3"></h3>
  <h3 class="mailto h3 link">
    If the error persists
    <a
      href="mailto:test@test.com?subject=Error Message on site"
      class="link"
      >please email me</a
    >
  </h3>`;
    errorWrapper.classList.remove("display-none");
    errorDetails.innerText = error;
    // console.log is here intentionally also
    console.log(error);
  }
  // else load data and remove the error wrapper element and children

  // load data and start to build charts

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
    let mbySlidervalue = document.querySelector("#mbySlidervalue");
    let sliderValueP = document.querySelector(".sliderValueP");

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
    // counters being assigned
    let numberMoviesCounter = document.querySelector(".number-of-movies-span");

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
    function createMoviesByYearTable() {
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

      for (let movies of dataForMoviesByYearChart) {
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
    }
    if (localStorage.getItem("accessbilityTables") === "shown") {
      createMoviesByYearTable();
    }
    // calling chart creation
    let moviesReleasedChart = new Chart(barChartArea, config);

    mbySlider.setAttribute("min", sliderMinMax[0]);
    mbySlider.setAttribute("max", sliderMinMax[1]);

    function updateChart(e) {
      let sliderValue = +e.target.value;
      sliderValueP.classList.remove("display-none");
      mbySlidervalue.textContent = `${sliderValue}`;
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
      function updateMoviesByYearTable() {
        if (localStorage.getItem("accessbilityTables") === "shown") {
          let mbyTableWrapper = document.querySelector(".mby-table-wrapper");
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

          for (let movies of result) {
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
        }
      }
      updateMoviesByYearTable();
      moviesReleasedChart.update();
      // update counters

      // update counter to include number of movies on year
      numberMoviesCounter.innerText = sum(
        (moviesReleasedChart.data.datasets[0].data = result.map(
          (d) => d.genreCount
        ))
      );
    }
    mbySlider.addEventListener("input", updateChart);
    let mbyButton = document.querySelector(".resetmoviesByYearChart");
    let mbycanvasWrapper = document.querySelector(
      ".canvas-wrapper-moviesByYearChart"
    );

    // btn to reset chart
    mbyButton.addEventListener("click", () => {
      mbySlider.value = sliderMinMax[0];
      mbySlidervalue.textContent = null;
      sliderValueP.classList.add("display-none");

      mbycanvasWrapper.innerHTML = null;
      mbycanvasWrapper.innerHTML = `<canvas id="moviesByYearChart"></canvas>`;
      moviesByYearChart();
      numberMoviesCounter.innerText =
        numberMoviesCounter.getAttribute("data-movies");
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
    let languageSliderP = document.querySelector(".sliderValueP2");
    let languageSliderOutput = document.querySelector(
      "#languagePieSlidervalue"
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
    function createLangaugeTable() {
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

      for (let movies of pieDataOnLoad) {
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
    }
    if (localStorage.getItem("accessbilityTables") === "shown") {
      createLangaugeTable();
    }
    let moviveLanguageChart = new Chart(pieChartArea, config);
    let resetlanguagePieChartBtn = document.querySelector(
      ".resetlanguagePieChart"
    );
    let languagePieCanvasWrapper = document.querySelector(
      ".language-pie-canvas-wrapper"
    );
    // btn to reset chart
    resetlanguagePieChartBtn.addEventListener("click", () => {
      languageSliderP.classList.add("display-none");
      languageSliderOutput.textContent = null;
      languagePieSlider.value = sliderMinMax[0];
      languagePieCanvasWrapper.innerHTML = null;
      languagePieCanvasWrapper.innerHTML = `<canvas id="languagePieArea"></canvas>`;
      pieChart();
    });

    languagePieSlider.addEventListener("input", (e) => {
      let sliderValue = +e.target.value;
      languageSliderP.classList.remove("display-none");
      languageSliderOutput.textContent = `${sliderValue}`;

      let result = pieDataOnInput.filter((d) => d.year === sliderValue);
      moviveLanguageChart.options.plugins.title.text = `Movies by language for year ${sliderValue}`;
      moviveLanguageChart.data.labels = result.map((d) => d.language);
      moviveLanguageChart.data.datasets[0].data = result.map(
        (d) => d.languageCount
      );

      function pieTableUpdate() {
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

        for (let movies of result) {
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
      }
      if (localStorage.getItem("accessbilityTables") === "shown") {
        pieTableUpdate();
      }
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
    let scatterValueP = document.querySelector(".sliderValueP3");
    let scatterSlidervalue = document.querySelector("#scatterSlidervalue");

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
        plugins: {
          title: {
            display: true,
            text: `Revenue Compared to Average Vote for all years`,
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                return `Revenue & vote Average for all years ${tooltipItem.formattedValue}`;
              },
            },
          },
        },
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
    function createScatterTable() {
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

      for (let movies of scatterDataOnLoad) {
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
    }
    if (localStorage.getItem("accessbilityTables") === "shown") {
      createScatterTable();
    }
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
      scatterValueP.classList.add("display-none");
      scatterSlidervalue.textContent = null;
      revBudgetCanvasWrapper.innerHTML = null;
      revBudgetCanvasWrapper.innerHTML = `<canvas id="revBudgetArea"></canvas>`;
      revBudget();
    });

    revBudgetSlider.addEventListener("input", (e) => {
      let sliderValue = +e.target.value;
      scatterValueP.classList.remove("display-none");
      scatterSlidervalue.textContent = `${sliderValue}`;

      let result = scatterDataforInputChart.filter(
        (d) => d.year === sliderValue
      );
      config.options.plugins.tooltip.callbacks.label = (tooltipItem) => {
        return `Revenue & Vote Average for year ${sliderValue}: ${tooltipItem.formattedValue}`;
      };
      scatterChart.options.plugins.title.text = `Revenue Compared to Vote Average For Year ${sliderValue}`;
      scatterChart.data.datasets[0].data = result;
      // scatterChart.options.scales.x.type = "linear";
      scatterChart.update();
      function updateScatterTable() {
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

        for (let movies of result) {
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
      }
      if (localStorage.getItem("accessbilityTables") === "shown") {
        updateScatterTable();
      }
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
      } else if (localStorage.getItem("accessbilityTables") === "hidden") {
        radioWrapperHidden.classList.add("display-none");
        radioWrapperShown.classList.remove("display-none");
        accessbilityTables.forEach((table) => {
          table.innerHTML = null;
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
        // canvas needs to be deleted first then redraw the whole chart, this allows the tables to load without reloading the entire page
        let mbycanvasWrapper = document.querySelector(
          ".canvas-wrapper-moviesByYearChart"
        );
        mbycanvasWrapper.innerHTML = null;
        mbycanvasWrapper.innerHTML = `<canvas id="moviesByYearChart"></canvas>`;
        moviesByYearChart();
        let languagePieCanvasWrapper = document.querySelector(
          ".language-pie-canvas-wrapper"
        );
        languagePieCanvasWrapper.innerHTML = null;
        languagePieCanvasWrapper.innerHTML = `<canvas id="languagePieArea"></canvas>`;
        pieChart();
        let revBudgetCanvasWrapper = document.querySelector(
          ".revBudget-canvas-wrapper"
        );
        revBudgetCanvasWrapper.innerHTML = null;
        revBudgetCanvasWrapper.innerHTML = `<canvas id="revBudgetArea"></canvas>`;
        revBudget();
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
      Chart.defaults.plugins.title.font.size = 16;
    } else {
      Chart.defaults.plugins.title.font.size = 10;
    }
  }

  function moviesByYearIncrementCounter() {
    let counter = document.querySelector(".counter");
    counter.innerText = "0";
    let numberOfMoviesByYear = flatGroup(rawData, (d) => d.release_date).sort();
    let numberOfMovies = numberOfMoviesByYear.length - 1;
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

  function avgRunTimeIncrementCounter() {
    let counter = document.querySelector(".avg-runtime-span");
    counter.innerText = "0";

    let runtime = Math.round(mean(rawData.map((d) => d.runtime)));

    counter.setAttribute("data-avgRunTime", runtime);
    counter.setAttribute("aria-label", runtime);

    const incrementCounter = () => {
      let target = +counter.getAttribute("data-avgRunTime");
      let increment = target / 1000;
      let currentNumber = +counter.textContent;
      if (currentNumber < target) {
        counter.innerText = `${Math.ceil(currentNumber + increment)}`;

        setTimeout(incrementCounter, 65);
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
  avgRunTimeIncrementCounter();

  function avgVote() {
    let counter = document.querySelector(".avg-vote-span");
    counter.innerText = "0";

    let voteAvg = Math.floor(
      sum(rawData, (d) => {
        if (d.vote_average >= 8) {
          return d.vote_average;
        } else {
          return;
        }
      })
    );

    counter.setAttribute("data-voteAverage", voteAvg);
    counter.setAttribute("aria-label", voteAvg);

    const incrementCounter = () => {
      let target = +counter.getAttribute("data-voteAverage");
      let increment = target / 1000;
      let currentNumber = +counter.textContent;
      if (currentNumber < target) {
        counter.innerText = `${Math.ceil(currentNumber + increment)}`;

        setTimeout(incrementCounter, 5);
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

  let inputSlider = document.querySelectorAll(".inputSlider");
  inputSlider.forEach((slider) => {
    slider.addEventListener("input", () => {
      let sliderValue = +slider.value;
      let numberOfYears = [sliderValue];

      let numberMoviesinFilter = document.querySelector(
        ".number-of-movies-span"
      );
      let avgRunTimeCard = document.querySelector(".avg-runtime-span");
      let avgVoteCard = document.querySelector(".avg-vote-span");
      let numberOfYearsCard = document.querySelector(".counter");
      let year = rawData.filter((d) => d.release_date === sliderValue);

      let avgRuntime = Math.round(mean(year.map((d) => d.runtime)));
      let voteAvgContent = Math.floor(
        sum(year, (d) => {
          if (d.vote_average >= 8) {
            return d.vote_average;
          } else {
            return;
          }
        })
      );

      let yearMap = year.map((d) => d.release_date);

      numberMoviesinFilter.textContent = yearMap.length;
      numberMoviesinFilter.setAttribute(
        "aria-label",
        `${numberMoviesinFilter.textContent}`
      );
      avgRunTimeCard.textContent = avgRuntime;
      avgRunTimeCard.setAttribute(
        "aria-label",
        `${avgRunTimeCard.textContent}`
      );
      avgVoteCard.textContent = voteAvgContent;
      avgVoteCard.setAttribute("aria-label", `${avgVoteCard.textContent}`);
      numberOfYearsCard.textContent = numberOfYears.length;
      numberOfYearsCard.setAttribute(
        "aria-label",
        `${numberOfYearsCard.textContent}`
      );
    });
  });
  let resetButtons = document.querySelectorAll(".reset");

  function resetCards() {
    let numberMoviesinFilterAttr = document
      .querySelector(".number-of-movies-span")
      .getAttribute("data-movies");
    let avgRunTimeCardAttr = document
      .querySelector(".avg-runtime-span")
      .getAttribute("data-avgruntime");
    let avgVoteCardAttr = document
      .querySelector(".avg-vote-span")
      .getAttribute("data-voteaverage");
    let numberOfYearsCardAttr = document
      .querySelector(".counter")
      .getAttribute("data-years");

    let numberOfMoviesInDatabaseCard = document.querySelector(
      ".number-of-movies-span"
    );
    let avgRunTimeCard = document.querySelector(".avg-runtime-span");
    let avgVoteCard = document.querySelector(".avg-vote-span");
    let numberOfYearsCard = document.querySelector(".counter");
    numberOfMoviesInDatabaseCard.textContent = numberMoviesinFilterAttr;
    numberOfMoviesInDatabaseCard.setAttribute(
      "aria-label",
      numberMoviesinFilterAttr
    );
    avgRunTimeCard.textContent = avgRunTimeCardAttr;
    avgRunTimeCard.setAttribute("aria-label", avgRunTimeCardAttr);
    avgVoteCard.textContent = avgVoteCardAttr;
    avgVoteCard.setAttribute("aria-label", avgVoteCardAttr);
    numberOfYearsCard.textContent = numberOfYearsCardAttr;
    numberOfYearsCard.setAttribute("aria-label", numberOfYearsCardAttr);
  }
  resetButtons.forEach((button) => {
    button.addEventListener("click", resetCards);
  });
  avgVote();
  // functions to call charts

  moviesByYearChart();
  pieChart();
  revBudget();
};

main();
window.addEventListener("load", () => {
  let loader = document.querySelector(".loader-wrapper");
  loader.remove();
});
