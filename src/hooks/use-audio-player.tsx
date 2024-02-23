import { useState, useEffect, createContext, useContext, ReactNode, FC } from "react";

type AudioPlayerContextType = {
  addToAudioQueue: (audioClipUri: Promise<string>) => void;
  clearAudioQueue: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  addToAudioQueue: () => {},
  clearAudioQueue: () => {},
});

const useAudioPlayer = () => useContext(AudioPlayerContext);

export const AudioPlayerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // We are managing promises of audio urls instead of directly storing strings
  // because there is no guarantee when openai tts api finishes processing and resolves a specific url
  // For more info, check this comment:
  // https://github.com/tarasglek/chatcraft.org/pull/357#discussion_r1473470003
  const [queue, setQueue] = useState<Promise<string>[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>();

  useEffect(() => {
    if (!isPlaying && queue.length > 0) {
      playAudio(queue[0]);
    }
  }, [queue, isPlaying]);

  const playAudio = async (audioClipUri: Promise<string>) => {
    setIsPlaying(true);
    const audioUrl: string = await audioClipUri;
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setCurrentAudioUrl(null);
      URL.revokeObjectURL(audioUrl);
      setQueue((oldQueue) => oldQueue.slice(1));
      setIsPlaying(false);
    };
    audio.play();
    setCurrentAudioUrl(audioUrl);
  };

  const addToAudioQueue = (audioClipUri: Promise<string>) => {
    setQueue((oldQueue) => [...oldQueue, audioClipUri]);
  };

  const clearAudioQueue = () => {
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }

    setQueue((oldQueue) => oldQueue.splice(0));
  };

  const value = { addToAudioQueue, clearAudioQueue };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

export default useAudioPlayer;