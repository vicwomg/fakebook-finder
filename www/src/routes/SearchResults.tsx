import React from "react";
import { useHistory } from "react-router-dom";
import styles from "./SearchResults.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export type SearchResult = {
  title: string;
  page: string;
  source: string;
};

export type CurrentSelection = {
  source: string;
  page: number;
};

const SearchResults = ({
  searchResults,
  searchQuery,
  currentSelection,
}: {
  searchResults: SearchResult[];
  searchQuery: string | null;
  currentSelection?: CurrentSelection;
}) => {
  const history = useHistory();

  const handleClick = (source: string, page: string, title: string) => {
    history.push(`/source/${source}/${page}`, {
      searchResults: searchResults,
      searchQuery: searchQuery,
      title: title,
    });
  };

  return (
    <div className={styles.results}>
      {searchResults.map((r, index) => {
        return (
          <div
            onClick={() => handleClick(r.source, r.page, r.title)}
            key={index}
            className={styles.result}
          >
            <h3>
              {currentSelection &&
                currentSelection.source === r.source &&
                Number(currentSelection.page) === Number(r.page) && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ marginRight: 10, color: "green" }}
                  />
                )}
              {r.title}
            </h3>
            <p>
              {r.source} - p.{r.page}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
