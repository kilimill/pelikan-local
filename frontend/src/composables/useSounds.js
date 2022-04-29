import soundCommon from '@/assets/wav/handup.wav';

export default function useSounds() {

  const soundUserCalled = soundCommon

  const playSound = (file) => {
    let audio = new Audio(file);
    audio.play().catch(e => console.error(e))
  }

  return {
    playUserCalledSound: () => playSound(soundUserCalled)
  }
}