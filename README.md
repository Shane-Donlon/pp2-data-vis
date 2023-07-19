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
  
  ![loading screen](assets/documentation/loading.jpg)
- Error Screen:
  
  ![Errpr message screen](assets/documentation/errormessage.jpg)
  ![Errpr message console screen](assets/documentation/errorMessageConsole.jpg)

  In the event that a user does receive an error the error message has instructions on what actions to take (refresh page) and if that continues to fail, there is a call to action within the error(mail:to link)
  The error is also intentinoally logged to the console. I remvoed the error details from the screen as to not include "technical jargon" to the user.

  
- Selection Change

- Reduced Motion
- Tooltips
- Accessibility Preferences
- Skip to Content link
- Chart Drill-down
