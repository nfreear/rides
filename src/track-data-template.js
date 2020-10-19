
export const trackDataTemplate = (TRK, RIDE) => `
| Title:      | ${RIDE.title}        |
|-------------|----------------------|
| Start date: | ${TRK.date}          |
| Ride time:  | ${TRK.rideTime}      |
| Distance:   | ${TRK.distance} km   |
| Mean speed: | ${TRK.avgSpeed} km/h |
| Max speed:  | ${TRK.maxSpeed} km/h |
| Paused:     | ${fRound(TRK.pauseSeconds / 60)} minutes |

\`\`\`
${JSON.stringify(TRK, null, '\t')}
\`\`\`
`;
// | <!-- Total time: ${fRound(TRK.totalSeconds / 60)} minutes-->
// <!-- <ul> <li> TEST </ul> -->

function fRound (fNumber, places = 3) {
  return parseFloat(Number.parseFloat(fNumber).toFixed(places));
}
