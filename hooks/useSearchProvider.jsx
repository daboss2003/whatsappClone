import React, { useContext } from "react";
import { SearchContext } from "../context/context";



export function useSearchProvider() {
    return useContext(SearchContext);
}