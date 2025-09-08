"use client";

import React from "react";
import { PiKeyReturn as ReturnIcon } from "react-icons/pi";
import styled from "styled-components";

const _ = require("lodash");

type RowType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
enum KeyStates {
  correct = "correct",
  empty = "empty",
  inactive = "inactive",
  partial = "partial",
  potential = "potential",
  wrong = "wrong",
}

enum KeyColors {
  correct = "#6aaa64",
  empty = "transparent",
  inactive = "#d3d6da",
  partial = "#c9b458",
  wrong = "#787c7e",
}

const LetterContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  width: full;
`;

const InputKey = styled.button<{
  $bigWidth?: boolean;
  $keyColor?: KeyStates;
  $smallText?: boolean;
}>`
  background-color: ${(props) =>
    props.$keyColor === "wrong"
      ? KeyColors.wrong
      : props.$keyColor === "correct"
      ? KeyColors.correct
      : props.$keyColor === "partial"
      ? KeyColors.partial
      : KeyColors.inactive};
  border: none;
  border-radius: 4px;
  font-size: ${(props) => (props.$smallText ? "" : "22px")};
  font-weight: 600;
  min-height: 52px;
  min-width: ${(props) => (props.$bigWidth ? "60px" : "42px")};
  padding: 8px 8px;
`;

const KeyRow = styled.div`
  display: flex;
  gap: 4px;
`;

const PrimaryContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
  justify-content: center;
  width: 100vw;
`;

const ScreenKey = styled(InputKey)<{
  $keyColor?: KeyStates;
}>`
  background-color: ${(props) =>
    props.$keyColor === KeyStates.wrong
      ? KeyColors.wrong
      : props.$keyColor === KeyStates.correct
      ? KeyColors.correct
      : props.$keyColor === KeyStates.partial
      ? KeyColors.partial
      : KeyColors.empty};
  border-color: ${(props) =>
    props.$keyColor === KeyStates.potential
      ? KeyColors.wrong
      : props.$keyColor === KeyStates.empty
      ? KeyColors.inactive
      : "transparent"};
  border-radius: 0;
  border-style: solid;
  border-width: 2px;
  font-size: 32px;
  min-height: 52px;
  min-width: 52px;
  padding: 0;
  color: ${(props) =>
    props.$keyColor === KeyStates.correct ||
    props.$keyColor === KeyStates.partial ||
    props.$keyColor === KeyStates.wrong
      ? "white"
      : "black"};
`;

const wordle = "taffy"; // The wordle of the day. This should eventually be fetched through an API!

type DupeEntry = {
  char: string;
  indices: number[];
};

// Identifying duplicate characters and their indices within the wordle word
const dupeCharAndIndex = wordle
  .split("")
  .reduce<DupeEntry[]>((acc, char, index, arr) => {
    // Check if char is duplicated in the word
    if (arr.indexOf(char) !== arr.lastIndexOf(char)) {
      let entry = acc.find((e) => e.char === char);
      if (entry) {
        entry.indices.push(index);
      } else {
        acc.push({ char, indices: [index] });
      }
    }
    return acc;
  }, []);

console.log(dupeCharAndIndex);

const keyboardKeys = {
  topRow: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  middleRow: ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  bottomRow: ["enter", "z", "x", "c", "v", "b", "n", "m", <ReturnIcon />],
};

const neutralWordState = {
  rowOne: "",
  rowTwo: "",
  rowThree: "",
  rowFour: "",
  rowFive: "",
  rowSix: "",
};

const rowOptions = Object.keys(neutralWordState);

export default function Home() {
  const [row, setRow] = React.useState<RowType>(1);
  const [words, setWords] = React.useState(neutralWordState);
  const [gameOver, setGameOver] = React.useState(false);

  const rowKey = rowOptions[row - 1] as keyof typeof words;

  // A function to drive keyboard character colours //
  const keyColorPicker = (char: string | React.JSX.Element) => {
    const usedCharacters: string[] = _.uniq(
      Object.values(words)
        .slice(0, row - 1)
        .join()
        .replaceAll(",", "")
        .split("")
    );
    const featuredCharacters = usedCharacters.filter((char) =>
      wordle.includes(char)
    );
    const correctCharacters = _.uniq(
      Object.values(words)
        .slice(0, row - 1)
        .map((word) =>
          word.split("").filter((char, idx) => char === wordle[idx])
        )
        .flatMap((char) => char)
    );
    if (typeof char !== "string") {
      return KeyStates.inactive;
    }
    if (correctCharacters.includes(char)) {
      return KeyStates.correct;
    } else if (featuredCharacters.includes(char)) {
      return KeyStates.partial;
    } else if (usedCharacters.includes(char)) {
      return KeyStates.wrong;
    } else {
      return KeyStates.inactive;
    }
  };

  // A function to drive the colours for guessed words //
  const wordColors = (rowNumber: RowType, characterIndex: number) => {
    const chosenRow = rowOptions[rowNumber - 1] as keyof typeof words;
    if (row > rowNumber) {
      if (words[chosenRow][characterIndex] === wordle[characterIndex]) {
        // Correct is for characters that match the Wordle word's character index
        return KeyStates.correct;
      } else if (
        wordle.split("").includes(words[chosenRow][characterIndex]) &&
        words[chosenRow][characterIndex] !== wordle[characterIndex]
      ) {
        // Partial is for characters that are in the Wordle word but don't match the character index
        console.log(words[chosenRow][characterIndex]);
        return KeyStates.partial;
      } else {
        // Wrong is for characters that don't feature in the Wordle word
        return KeyStates.wrong;
      }
    } else if (
      row === rowNumber &&
      words[chosenRow][characterIndex] !== undefined
    ) {
      // Potential keeps characters neutral on the current row before a word is submitted
      return KeyStates.potential;
    } else {
      // Empty is mostly for rows that aren't yet active
      return KeyStates.empty;
    }
  };

  // A utility function to help drive keyboard functionality //
  const setCharsForCurrentRow = (char?: string) => {
    if (char) {
      // If a 'char' is present as a prop, it assumes a character is being typed and will attempt to enter it
      setWords((prevWords) => ({
        ...prevWords,
        [rowKey]: prevWords[rowKey] + char,
      }));
    } else {
      // If a 'char' isn't present, it assumed the user is trying to remove a character and will delete the last character in the word
      setWords((prevWords) => ({
        ...prevWords,
        [rowKey]: prevWords[rowKey].slice(0, -1),
      }));
    }
  };

  // A utility function to help the program move onto the next row if "enter" is clicked //
  const nextRow = (r: RowType): RowType => {
    if (r <= 6) return (r + 1) as RowType;
    console.log({ r });
    return r;
  };

  // A function to drive the keyboard //
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const char = e.currentTarget.value;

    const victorious = words[rowKey] === wordle;

    const finishGame = (victorious: boolean) => {
      setRow(nextRow(row));
      setGameOver(true);
      setTimeout(
        () => alert(victorious ? "You win!" : "Better luck next time..."),
        500
      );
    };

    if (char.length > 1) {
      // Checking to see if the pressed key is either "enter" or "backspace"
      if (char === "undo") {
        // Removing characters
        setCharsForCurrentRow();
      } else {
        // Trying word and setting new row
        if (victorious || row === 6) {
          finishGame(victorious);
        } else {
          setRow(nextRow(row));
        }
      }
    } else {
      // Typing character
      setCharsForCurrentRow(char);
    }
  };

  // A component for the character/word guesses //
  const WordRow = ({ row }: { row: RowType }) => {
    const chosenRow = rowOptions[row - 1] as keyof typeof words;
    return (
      <KeyRow>
        {wordle.split("").map((_, idx) => {
          return (
            <ScreenKey key={idx} $keyColor={wordColors(row, idx)}>
              {words[chosenRow][idx]?.toUpperCase()}
            </ScreenKey>
          );
        })}
      </KeyRow>
    );
  };

  // A function to help conditionally disable keyboard keys //
  const disableCharacters = (
    rowNum: number,
    utility: "empty" | "full" | "under"
  ) => {
    if (utility === "full") {
      return row === rowNum && words[rowKey].length === 5;
    } else if (utility === "empty") {
      return row === rowNum && words[rowKey].length === 0;
    } else {
      return row === rowNum && words[rowKey].length < 5;
    }
  };

  const outOfCharacters =
    disableCharacters(1, "full") ||
    disableCharacters(2, "full") ||
    disableCharacters(3, "full") ||
    disableCharacters(4, "full") ||
    disableCharacters(5, "full") ||
    disableCharacters(6, "full");

  const noCharacters =
    disableCharacters(1, "empty") ||
    disableCharacters(2, "empty") ||
    disableCharacters(3, "empty") ||
    disableCharacters(4, "empty") ||
    disableCharacters(5, "empty") ||
    disableCharacters(6, "empty");

  const tooFewCharacters =
    disableCharacters(1, "under") ||
    disableCharacters(2, "under") ||
    disableCharacters(3, "under") ||
    disableCharacters(4, "under") ||
    disableCharacters(5, "under") ||
    disableCharacters(6, "under");

  return (
    <PrimaryContainer>
      <LetterContainer>
        {rowOptions.map((_, idx) => {
          return <WordRow key={idx} row={(idx + 1) as RowType} />;
        })}
      </LetterContainer>
      <LetterContainer>
        <KeyRow>
          {keyboardKeys.topRow.map((key, id) => {
            return (
              <InputKey
                disabled={outOfCharacters || gameOver}
                key={id}
                $keyColor={keyColorPicker(key)}
                onClick={(e) => handleClick(e)}
                value={key}
              >
                {key.toUpperCase()}
              </InputKey>
            );
          })}
        </KeyRow>
        <KeyRow>
          {keyboardKeys.middleRow.map((key, id) => {
            return (
              <InputKey
                disabled={outOfCharacters || gameOver}
                key={id}
                $keyColor={keyColorPicker(key)}
                onClick={(e) => handleClick(e)}
                value={key}
              >
                {key.toUpperCase()}
              </InputKey>
            );
          })}
        </KeyRow>
        <KeyRow>
          {keyboardKeys.bottomRow.map((key, id) => {
            return (
              <InputKey
                $bigWidth={typeof key !== "string"}
                disabled={
                  ((typeof key !== "string" || key.length > 1) &&
                    noCharacters) ||
                  (key === "enter" && tooFewCharacters) ||
                  (typeof key === "string" &&
                    key.length === 1 &&
                    outOfCharacters) ||
                  gameOver
                }
                key={id}
                $keyColor={keyColorPicker(key)}
                onClick={(e) => handleClick(e)}
                $smallText={key === "enter"}
                value={typeof key === "string" ? key : "undo"}
              >
                {typeof key === "string" ? key.toUpperCase() : key}
              </InputKey>
            );
          })}
        </KeyRow>
      </LetterContainer>
    </PrimaryContainer>
  );
}
