export default function usePlaybackTimer(){

  const secondsToTime = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8)
  }

  return {
    secondsToTime,
  }
}