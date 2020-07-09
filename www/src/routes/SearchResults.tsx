import React from "react";
import { useHistory } from "react-router-dom";
import styles from "./SearchResults.module.css";

export type SearchResult = {
  title: string;
  page: string;
  source: string;
};

const SearchResults = ({
  searchResults,
  searchQuery,
}: {
  searchResults: SearchResult[];
  searchQuery: string | null;
}) => {
  const history = useHistory();

  const handleClick = async (source: string, page: string) => {
    history.push(`/source/${source}/${page}`, {
      searchResults: searchResults,
      searchQuery: searchQuery,
    });
  };

  return (
    <div className={styles.results}>
      {searchResults.map((r, index) => (
        <div
          onClick={() => handleClick(r.source, r.page)}
          key={index}
          className={styles.result}
        >
          <h3>{r.title}</h3>
          <p>
            {r.source} - p.{r.page}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
