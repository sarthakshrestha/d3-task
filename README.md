# Video Game Companies Market Cap Visaulized

## Steps to Run the Project

1.  **Install Dependencies**:

    ```
    npm install
    ```

2.  **Run the Development Server**:

    ```
    npm run dev
    ```

## Technologies Used

- **Framework/Library**: React
- **Styling**: Tailwind CSS, Shadcn
- **Toast Notifications**: Sonner
- **Data Fetching**: Axios
- **Animations**: Built in D3.js for SVG Animations (d3-transition)
- **Charting**: D3.js

## Approach

1. Utilize shadcn libraries for quickly building a design-centric website for data-visualization.
2. Leveraging tailwindcss classes for responsiveness and consistent styling across devices.
3. Download a dataset from an open source website- Found a dataset that I personally found interesting on companiesmarketcap.
4. Utilize the CSV to first create the bar graph and then the scatterplot.
5. Refractored the code as for the utils to D3.js as for the declarative syntax requires long lines of code.
6. Post-code-refractoring start working on the fetch API.
7. Implementing Axios along with an axiosInstance for better functionality to fetch.
8. Added sonner to represent Errors/Successes during load times.
9. Integrated World Bank API for fetching data.

## Challenges Faced

- **D3.js Learning Curve**: Mastering D3.js's declarative syntax required significant amount of time.

- **Static Asset Deployment**: Resolved issues with CSV file path resolution during production deployment, which required adjustments to the data loading strategy.

- **Chart Component Architecture**: Developing reusable chart components with properly aligned axes and labels required a lot of coordination

- **Future Improvements**: For future/further improvements when fetching the API from World Bank API, the labels of the axes can be dynamically changed according to the category fetched through an axios call.

## Data Source

- Data is sourced from: [Largest Video Game Companies by Market Cap](https://companiesmarketcap.com/video-games/largest-video-game-companies-by-market-cap/)
