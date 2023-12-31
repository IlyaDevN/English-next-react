import clsx from "clsx";
import { LESSONS } from "../staticData/lessons";
import { Source_Sans_3 } from "next/font/google";
import { UiButton } from "../components/ui/UiButton";
import { ContentField } from "../components/ui/ContentField";
import { InputSentenceField } from "../components/ui/InputSentenceField";
import { useState, useRef, useEffect } from "react";
import SelectLesson from "../components/ui/SelectLesson";
import Counter from "../components/Counter";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "900"],
});

export default function ServerSentences() {
  const [initialData, setInitialData] = useState();
  const [sentences, setSentences] = useState([]);
  const [randomNumber, setRandomNumber] = useState();
  const [currentAnswer, setCurrentAnswer] = useState();
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [inputContent, setInputContent] = useState("");
  const [translationsCounter, setTranslationsCounter] = useState(0);
  const count = useRef();

  async function selectHandler(value) {

	if(isDataAvailable) {
		handleReset();
	}

	const response = await fetch(
        LESSONS[value],
      );
      const data = await response.json();
      setInitialData(data);
      setSentences(data);
      setRandomNumber(getRandomNumber(0, data.length));
      count.current = data.length;
      setIsDataAvailable(true);
  }

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
	if(!isDataAvailable) {
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
	setTranslationsCounter(oldCount => oldCount + 1);
  }

  function handleShowTranslation() {
	if(!isDataAvailable) {
		return;
	}
    if (sentences.length) {
      setCurrentAnswer(sentences[randomNumber].eng_sentence);
    } else {
      setCurrentAnswer("Урок окончен");
    }
  }

  function handleReset() {
	if(!isDataAvailable) {
		return;
	}
    setSentences(initialData);
    count.current = initialData.length;
    setRandomNumber(getRandomNumber(0, count.current));
    setCurrentAnswer("");
    setInputContent("");
	setTranslationsCounter(0);
  }

  function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
  }

  return (
    <div className="px-4 py-7">
      <div
        className={clsx(
          sourceSans3.className,
          "w-full bg-orange-100 border-4 border-s-gray-100 rounded-2xl px-3.5 py-3.5 flex flex-col gap-4 bg-opacity-80",
        )}
      >
		<div className="flex gap-5">
			<SelectLesson onChange={selectHandler}/>
			<Counter value={translationsCounter}/>
		</div>
        <ContentField>
          {isDataAvailable &&
            (sentences.length
              ? sentences[randomNumber].rus_sentence
              : "The lesson is over")}
        </ContentField>
        <ContentField className={currentAnswer ? "" : "text-opacity-50"}>
          {currentAnswer || "Нажмите на кнопку показать перевод"}
        </ContentField>
        <InputSentenceField
          placeholder="Напишите перевод"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
        />
        <UiButton onClick={handleShowTranslation}>Показать перевод</UiButton>
        <UiButton onClick={handleNextSentence}>Следующее предложение</UiButton>
        <UiButton onClick={handleReset}>Начать сначала</UiButton>
      </div>
    </div>
  );
}
