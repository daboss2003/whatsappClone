import { useEffect, useState } from "react";

export function useLimitWords(text) {
    const [container, setContainer] = useState(null);
    const [limitText, setLimitText] = useState('');


    useEffect(() => {
        if (container) {
            const chars = Math.floor(container / 6.5);
            setLimitText(calculateMaxWords(text, chars));
        }
    }, [container, text]);

    function calculateMaxWords(text, chars) {
        let words = text.split(' ');
        let charCount = 0;
        let wordCount = 0;

        for (let word of words) {
            charCount += word.length + 1;
            if (charCount > chars) {
                break;
            }
            wordCount++
        }
        const textToReturn = words.slice(0, wordCount).join(' ')
        if (text.length > textToReturn.length) {
            return textToReturn + '...'
        }
        else {
            return  textToReturn ;
        }
       
    }

    return { limitText, setContainer }
}