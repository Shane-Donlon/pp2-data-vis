# The Movie Dashboard Data Visualisation
[The Movie Dashboard](https://shane-donlon.github.io/pp2-data-vis/) is an interactive, and responsive dashboard page to visualise movie data from 2000 to 2013 visualising 17,986 movies.
 ![Site Showcase](assets/documentation/pp2-amiresponsive.jpg)

 To note: there seems to be an issue between JavaScript and the Am I responsive website which is causing the charts to not appear in the above screenshots.  
## Technologies Used:

- [HTML](https://en.wikipedia.org/wiki/HTML)
- [CSS](https://en.wikipedia.org/wiki/CSS)
- [Javascript](https://en.wikipedia.org/wiki/JavaScript)
- [D3.js library](https://d3js.org/)
- [Chart.js library](https://en.wikipedia.org/wiki/Chart.js)
- [Anime.js library](https://animejs.com/)
- [Google fonts](https://fonts.google.com/)
- [Font awesome](https://fontawesome.com/)


## User stories:
- As a first-time user, I want it to be apparent the purpose of the Website, and is clear on how to use. 
- As a first-time user, I want to see the titles of each chart to easily understand what data I am analysing.
- As a user of the Website, I want to analyse data as well as get high level overviews.
- As a mobile device user, I want a minimal version of the website for high level overviews only.
- As an accessible user I want to be able to skip navigations and recurring content by choice.
- As an accessible user I want to be able to access the data in tabular format.
- As a recurring accessible user I want my accessibility preferences saved to improve my experience.
- As a user I want my reduced motion preferences adhered to.

## Features:
- Loading Screen:
  
  Loading screen appears while content is loading, within the JavaScript I used the eventListener "load" as oppposed to "DomContentLoaded" as I wanted the JavaScript file to render also.
  There is a slight animation on the "o" that is in the shape of a doughnut chart style.
  
  https://github.com/Shane-Donlon/pp2-data-vis/assets/130906067/3047cf80-e770-4fa1-9233-a936bac612aa


- Error Screen:
  
  ![Errpr message screen](assets/documentation/errormessage.jpg)
  ![Errpr message console screen](assets/documentation/errorMessageConsole.jpg)

  In the event that a user does receive an error the error message has instructions on what actions to take (refresh page) and if that continues to fail, there is a call to action within the error(mail:to link)
  The error is also intentinoally logged to the console. I remvoed the error details from the screen as to not include "technical jargon" to the user.

  
- Selection Change
  
  ![Selection Change Highlight](assets/documentation/selectionChange.jpg)
  
  The ::selection pseudo-element has also been updated, as this improves contrast ratio, as the standard "royalblue" selection did not provide enough contrast


- Reduced Motion
  As you can see in the below video that the counters increment, but if the user has a prefers reduced motion set, these do not increment and are instead static.

https://github.com/Shane-Donlon/pp2-data-vis/assets/130906067/dd781308-8cf7-4057-a11c-eb75184a9398


- Tooltips

  
  The below tool tips were custom build using JavaScript functions as the standard Chart.JS tooltips did not accurately convey a summary of the data shown

  The line chart hover tool tip - which highlights the year, and number of movies released

  ![line Chart ToolTips](assets/documentation/mbyTooltip.jpg)

  The bar chart hover tool tip which highlights the movie genre and the number of movies released

  ![Bar Chart ToolTips](assets/documentation/mbyTooltipGenre.jpg)

  The scatterplot chart hover tool tip

  ![Scatter Plot ToolTips](assets/documentation/scatterToolTip.jpg)

- Skip to Content link

  When tabbing through the site the user will be preseneted with a skip to content link which bypasses the header section and is linked to  `<main>`

  ![Skip to content link](assets/documentation/skipLink.jpg)
- Accessibility Preferences

- Chart Drill-down
