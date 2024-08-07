/* eslint-disable react-hooks/exhaustive-deps */
import clsx from "clsx";
import { TASKS } from "../staticData";
import { Source_Sans_3 } from "next/font/google";
import { UiButton } from "../components/ui/UiButton";
import { ContentField } from "../components/ui/ContentField";
import { InputSentenceField } from "../components/ui/InputSentenceField";
import { useState, useRef, useEffect, useContext } from "react";
import SelectLesson from "../components/ui/SelectLesson";
import Counter from "../components/Counter";
import ReverseLangButton from "../components/ui/ReverseLangButton";
import AudioPlayer from "../components/ui/AudioPlayer";
import { getTheSound } from "../voiceAPI";
import { ContentContext } from "../context";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "900"],
});

export default function ServerSentences() {
  const [initialData, setInitialData] = useState();
  const [sentences, setSentences] = useState([]);
  const [randomNumber, setRandomNumber] = useState();
  const [currentAnswer, setCurrentAnswer] = useState();
  const [isCurrentWordTranslated, setIsCurrentWordTranslated] = useState(false);
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [inputContent, setInputContent] = useState("");
  const [translationsCounter, setTranslationsCounter] = useState(0);
  const [currentTask, setCurrentTask] = useState();
  const [isRusEng, setIsRusEng] = useState(true);
  const count = useRef();
  const textarea_ref = useRef();
  const [questionAudioSrc, setQuestionAudioSrc] = useState();
  const [answerAudioSrc, setAnswerAudioSrc] = useState();
  const { isSoundOn } = useContext(ContentContext);
  const RUSSIAN = "ru-ru";
  const ENGLISH_GB = "en-gb";
  // const ENGLISH_US = "en-us";

  useEffect(() => {
    setCurrentTask(JSON.parse(localStorage.getItem("currentTask")));
  }, []);

  async function selectHandler(value) {
    if (isDataAvailable) {
	  setCurrentAnswer("");
      setInputContent("");
	  setTranslationsCounter(0);
	  setIsCurrentWordTranslated(false);
    }

    const response = await fetch(value);
    const data = await response.json();
    setInitialData(data);
    setSentences(data);
    setRandomNumber(getRandomNumber(0, data.length));
    count.current = data.length;
    setIsDataAvailable(true);
	textarea_ref.current.focus();
  }

  useEffect(() => {
	if(!isSoundOn || !isDataAvailable) {
		return;
	}

	function getPhrase() {
		if(sentences.length) {
			if(isRusEng) {
				return sentences[randomNumber].rus_sentence;
			} else {
				return sentences[randomNumber].eng_sentence;
			}
		} else {
			if(isRusEng) {
				return "Конец";
			} else {
				return "The end";
			}			
		}
	}

	function getLanguage() {
		if(isRusEng) {
			return RUSSIAN;
		} else {
			return ENGLISH_GB;
		}
	}
	
	function getVoiceAuthor() {
		if(isRusEng) {
			return "Olga";
		} else {
			return "Alice";
		}
	}

	const phrase = getPhrase();
	const voice = getVoiceAuthor();
	const language = getLanguage();

	getTheSound(phrase, voice, language, setQuestionAudioSrc);

  }, [randomNumber, isRusEng]);

  useEffect(()=> { //Missing empty sentences)
	if(sentences[randomNumber]?.rus_sentence === "." || sentences[randomNumber]?.rus_sentence === "?") {
		handleNextSentence();
	}
  }, [count.current])

  useEffect(() => {
    if (currentAnswer) {
      handleShowTranslation();
    }
  }, [isRusEng]);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       const response = await fetch(
  //         "https://ilyadevn.github.io/JsonApi/lesson_1.json",
  //       );
  //       const data = await response.json();
  //       setInitialData(data.db);
  //       setSentences([...sentences, ...data.db]);
  //       setRandomNumber(getRandomNumber(0, data.db.length));
  //       count.current = data.db.length;
  //       setIsDataAvailable(true);
  //     };

  //     fetchData();
  //   }, []);

  function handleNextSentence() {
    if (!isDataAvailable) {
      return;
    }
    if (count.current === 0) {
      return;
    }
    const sentencesCopy = sentences.slice();
    sentencesCopy.splice(randomNumber, 1);
    setSentences(sentencesCopy);
    count.current -= 1;
    setRandomNumber(getRandomNumber(0, count.current));
    setCurrentAnswer("");
    setInputContent("");
    setIsCurrentWordTranslated(false);
	if(sentences[randomNumber].rus_sentence === "." || sentences[randomNumber].rus_sentence === "?") {
		return;
	}
    setTranslationsCounter((oldCount) => oldCount + 1);
  }

  function handleShowTranslation() {
    if (!isDataAvailable) {
      return;
    }
    if (sentences.length) {
      setCurrentAnswer(
        isRusEng
          ? sentences[randomNumber].eng_sentence
          : sentences[randomNumber].rus_sentence,
      );
    } else {
      setCurrentAnswer("Урок окончен.");
    }

	if(!isSoundOn) {
		return;
	}

	function getPhrase() {
		if(sentences.length) {
			if(isRusEng) {
				return sentences[randomNumber].eng_sentence;
			} else {
				return sentences[randomNumber].rus_sentence;
			}
		} else {
			if(isRusEng) {
				return "Конец";
			} else {
				return "The end";
			}			
		}
	}

	function getLanguage() {
		if(isRusEng) {
			return ENGLISH_GB;
		} else {
			return RUSSIAN;
		}
	}
	
	function getVoiceAuthor() {
		if(isRusEng) {
			return "Alice";
		} else {
			return "Olga";
		}
	}

	const phrase = getPhrase();
	const voice = getVoiceAuthor();
	const language = getLanguage();

	getTheSound(phrase, voice, language, setAnswerAudioSrc);
  }

  useEffect(() => {
    function keydownHandler(e) {
      if (e.code === "Enter") {
        e.preventDefault();
        if (currentAnswer) {
          handleNextSentence();
        } else {
          handleShowTranslation();
        }
      }
    }

    document.addEventListener("keydown", keydownHandler);

    return () => document.removeEventListener("keydown", keydownHandler);
  }, [currentAnswer, handleNextSentence, handleShowTranslation]);

  function handleReset() {
    if (!isDataAvailable) {
      return;
    }
    if (!confirm("Вы действительно хотите начать сначала?")) {
      return;
    }
    resetTraining();
  }

  function resetTraining() {
    setSentences(initialData);
    count.current = initialData.length;
    setRandomNumber(getRandomNumber(0, count.current));
    setCurrentAnswer("");
    setInputContent("");
    setTranslationsCounter(0);
    setIsCurrentWordTranslated(false);
  }

  function showWordTranslation() {
    setIsCurrentWordTranslated((currentWord) => !currentWord);
  }

  function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
  }

  return (
    <div className="px-4">
      <div
        className={clsx(
          sourceSans3.className,
          "w-full max-w-4xl mx-auto align-middle bg-orange-100 border-4 border-s-gray-100 rounded-2xl px-3.5 py-3.5 flex flex-col gap-4 bg-opacity-80",
        )}
      >
        <div className="flex justify-between flex-wrap">
          <SelectLesson onChange={selectHandler} options={TASKS[currentTask]} />
          <Counter value={translationsCounter} />
          <ReverseLangButton onClick={setIsRusEng} isRusEng={isRusEng} />
        </div>
        {currentTask === "words" && (
          <UiButton
            onClick={showWordTranslation}
            className={clsx(
              isCurrentWordTranslated &&
                "text-lg text-yellow-900 font-normal normal-case bg-white bg-opacity-50 ",
              "min-h-[84px] h-auto rounded-lg tracking-wider",
            )}
          >
            {isDataAvailable &&
              (sentences.length
                ? isRusEng
                  ? isCurrentWordTranslated
                    ? sentences[randomNumber].eng_word
                    : sentences[randomNumber].rus_word
                  : isCurrentWordTranslated
                  ? sentences[randomNumber].rus_word
                  : sentences[randomNumber].eng_word
                : "")}
          </UiButton>
        )}
        <ContentField>
          {isDataAvailable &&
            (sentences.length
              ? isRusEng
                ? sentences[randomNumber].rus_sentence
                : sentences[randomNumber].eng_sentence
              : "The end.")}
        </ContentField>
        <InputSentenceField
          placeholder="Напишите перевод"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          textarea_ref={textarea_ref}
        />
        <UiButton
          className={clsx(
            currentAnswer &&
              "text-left text-lg text-yellow-900 font-normal normal-case bg-white bg-opacity-50 ",
            "min-h-[84px] h-auto rounded-lg",
          )}
          onClick={handleShowTranslation}
        >
          {currentAnswer || "Показать перевод"}
        </UiButton>
        <UiButton onClick={handleNextSentence}>Следующее предложение</UiButton>
        <UiButton onClick={handleReset}>Начать сначала</UiButton>
		<AudioPlayer src={questionAudioSrc}/>
		<AudioPlayer src={answerAudioSrc}/>
      </div>
    </div>
  );
}
