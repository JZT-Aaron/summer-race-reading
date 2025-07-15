import { useEffect, useState } from "react";

export function useDebounce(value, delay) {
    const [debouncedValue, setDeboundcedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDeboundcedValue(value);
                return clearTimeout(handler);
            }, delay);
        }, [delay, value]);
}